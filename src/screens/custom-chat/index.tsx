import { TitleBar } from '../../components/TitleBar'
import { AssistantMessageView } from '../../components/chat/AssistantMessageView'
import { AppDividerView } from '../../components/chat/DividerMessageView'
import { InputBar } from '../../components/chat/InputBar'
import { SSEMessageView } from '../../components/chat/SSEMessageView'
import { UserMessageView } from '../../components/chat/UserMessageView'
import { useInfinitePageDataLoader } from '../../components/query/infinite-hooks'
import { dbInsertCustomChatMessageSimply, fillTCustomChatWithDefaults } from '../../db/helper'
import { dbUpdateCustomChatWhere } from '../../db/table/t-custom-chat'
import {
  dbDeleteCustomChatMessageOfChatId,
  useInfiniteQueryCustomChatMessagePageable,
} from '../../db/table/t-custom-chat-message'
import { hapticError, hapticSuccess, hapticWarning } from '../../haptic'
import { useOpenAIApiCustomizedOptions, useOpenAIApiUrlOptions } from '../../http/apis/hooks'
import { sseRequestChatCompletions } from '../../http/apis/v1/chat/completions'
import { useHideChatAvatarPref } from '../../preferences/storages'
import { print } from '../../printer'
import { dimensions } from '../../res/dimensions'
import { useThemeScheme } from '../../themes/hooks'
import { toast } from '../../toast'
import { BaseMessage, ChatMessage } from '../../types'
import {
  updateCustomChatSettings,
  useCustomChatSettings,
} from '../../zustand/stores/custom-chat-settings-helper'
import { useSSEMessageStore } from '../../zustand/stores/sse-message-store'
import type { RootStackParamList } from '../screens'
import { generateMessagesToSend } from './helper'
import {
  SettingsSelectorModal,
  SettingsSelectorModalHandle,
} from './settings/SettingsSelectorModal'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'
import { KeyboardEvents, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import EventSource from 'react-native-sse'

type Props = NativeStackScreenProps<RootStackParamList, 'CustomChat'>

export function CustomChatScreen({ navigation, route }: Props): JSX.Element {
  const { chat } = route.params
  const { id } = chat

  const settingsModalRef = useRef<SettingsSelectorModalHandle>(null)
  const settings = fillTCustomChatWithDefaults(id, useCustomChatSettings(id))
  const { chat_name, system_prompt, avatar, font_size, context_messages_num } = settings

  const { t } = useTranslation()

  const [freshMessages, setFreshMessages] = useState<BaseMessage[]>([])
  const legacyPageSize = context_messages_num > 20 ? 100 : 20
  const legacyResult = useInfiniteQueryCustomChatMessagePageable(id, legacyPageSize)
  const { items: legacyMessages, onFetchNextPage: onEndReached } =
    useInfinitePageDataLoader(legacyResult)

  const finalMessages = useMemo<ChatMessage[]>(() => {
    const legacyItems: BaseMessage[] = legacyMessages.map(v => {
      return {
        role: v.role,
        content: v.content,
      }
    })
    const messages: BaseMessage[] = [...freshMessages, ...legacyItems]
    const result: ChatMessage[] = []
    let count = 0
    let encounterDivider = false
    for (const item of messages) {
      if (item.role !== 'user' && item.role !== 'assistant' && item.role !== 'divider') {
        continue
      }
      if (item.role === 'divider') {
        encounterDivider = true
      }
      let inContext: boolean | null = null
      if (!encounterDivider) {
        inContext = count < context_messages_num
      }
      count += 1
      result.push({ role: item.role, content: item.content, inContext })
    }
    result.push({
      role: 'divider',
      content: '0',
      inContext: null,
    })
    return result
  }, [context_messages_num, freshMessages, legacyMessages, t])
  const inContextNum = useMemo(() => {
    let count = 0
    for (const item of finalMessages) {
      if (item.inContext !== true) {
        break
      }
      count += 1
    }
    return count
  }, [finalMessages])

  const { urlOptions, checkIsOptionsValid } = useOpenAIApiUrlOptions()
  const customizedOptions = useOpenAIApiCustomizedOptions()

  const { backgroundChat: backgroundColor } = useThemeScheme()
  const [hideChatAvatar] = useHideChatAvatarPref()

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation()
  const enablekeyboardAvoid = useSharedValue(true)
  const transformStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: enablekeyboardAvoid.value ? keyboardHeight.value : 0 }] }
  }, [])

  const messageListRef = useRef<FlatList<ChatMessage>>(null)
  const scrollToTop = useCallback((delay = 200) => {
    const fn = () => messageListRef.current?.scrollToOffset({ offset: 0, animated: true })
    delay > 0 ? setTimeout(fn, delay) : fn()
  }, [])
  useEffect(() => {
    const show = KeyboardEvents.addListener('keyboardWillShow', () => scrollToTop(0))
    return () => show.remove()
  }, [freshMessages.length])

  const [inputText, setInputText] = useState('')

  const status = useSSEMessageStore(state => state.status)
  const sendDisabled = inputText.trim() && status !== 'sending' ? false : true
  const setStatus = useSSEMessageStore(state => state.setStatus)
  const setContent = useSSEMessageStore(state => state.setContent)

  const esRef = useRef<EventSource | undefined>(undefined)
  const esRequesting = useRef(false)
  useEffect(() => {
    // print('esRequesting.current = ' + esRequesting.current)
    if (esRequesting.current) {
      esRef.current?.close()
      setStatus('none')
    }
  }, [setStatus])
  const onSendPress = () => {
    if (!checkIsOptionsValid()) {
      return
    }
    setInputText('')
    setFreshMessages([{ role: 'user', content: inputText }, ...freshMessages])
    dbInsertCustomChatMessageSimply({
      chat_id: id,
      role: 'user',
      content: inputText,
    })
    const messages = generateMessagesToSend({
      systemPrompt: system_prompt,
      currentMessages: finalMessages,
      userMessageContent: inputText,
    })
    scrollToTop()
    setStatus('sending')
    esRequesting.current = true
    esRef.current?.close()
    esRef.current = sseRequestChatCompletions(urlOptions, customizedOptions, messages, {
      onNext: content => {
        setContent(content)
        scrollToTop(0)
      },
      onError: (code, message) => {
        setStatus('complete')
        hapticError()
        toast('warning', code, message)
      },
      onDone: message => {
        setFreshMessages(prev => [{ role: 'assistant', content: message.content }, ...prev])
        dbInsertCustomChatMessageSimply({
          chat_id: id,
          role: 'assistant',
          content: message.content,
        })
        setStatus('complete')
        setContent('')
        hapticSuccess()
        scrollToTop()
      },
      onComplete: () => {
        esRequesting.current = false
      },
    })
  }

  const handleSharePress = (_: ChatMessage, index: number) => {
    print('handleSharePress', { index })
    const messages: ChatMessage[] = []
    for (let i = index - 1; i >= 0; i--) {
      const item = finalMessages[i]
      if (item.role === 'divider') {
        break
      }
      messages.push(item)
    }
    if (messages.length === 0) {
      toast('warning', 'No valid messages', '')
      return
    }
    navigation.push('ShareChat', { avatar, fontSize: font_size, messages })
  }

  const renderItemSeparator = () => <View style={{ height: dimensions.messageSeparator }} />

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['left', 'right']}>
        <TitleBar
          title={chat_name ? chat_name : t('Unnamed')}
          subtitle={system_prompt ?? ''}
          action={{
            iconName: 'tune',
            onPress: () => settingsModalRef.current?.show(),
          }}
        />
        <View style={[{ flex: 1, overflow: 'hidden' }]}>
          <Animated.View style={[{ flex: 1 }, transformStyle]}>
            {/*
             * The FlashList with an inverted orientation has an incorrect location for the vertical scroll indicator on the left side.
             * Therefore, it should be replaced by a FlatList.
             */}
            <FlatList
              ref={messageListRef}
              contentContainerStyle={{ paddingVertical: dimensions.messageSeparator }}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              inverted={true}
              data={finalMessages}
              keyExtractor={(item, index) => `${index}_${item.role}_${item.content}`}
              renderItem={({ item, index }) => {
                if (item.role === 'divider') {
                  return (
                    <AppDividerView index={index} message={item} onSharePress={handleSharePress} />
                  )
                }
                if (item.role === 'user') {
                  return (
                    <UserMessageView
                      hideChatAvatar={hideChatAvatar}
                      fontSize={font_size}
                      message={item}
                    />
                  )
                }
                if (item.role === 'assistant') {
                  return (
                    <AssistantMessageView
                      avatar={avatar}
                      hideChatAvatar={hideChatAvatar}
                      fontSize={font_size}
                      message={item}
                    />
                  )
                }
                return null
              }}
              ItemSeparatorComponent={renderItemSeparator}
              ListHeaderComponent={
                <SSEMessageView fontSize={font_size} hideChatAvatar={hideChatAvatar} />
              }
              onEndReached={() => {
                console.log('onEndReached')
                onEndReached()
              }}
            />
          </Animated.View>
        </View>
        <InputBar
          value={inputText}
          sendDisabled={sendDisabled}
          inContextNum={inContextNum}
          contextMessagesNum={context_messages_num}
          onChangeText={setInputText}
          onSendPress={onSendPress}
          onNewDialoguePress={() => {
            setFreshMessages([
              {
                role: 'divider',
                content: '1',
              },
              ...freshMessages,
            ])
            dbInsertCustomChatMessageSimply({
              chat_id: id,
              role: 'divider',
              content: '1',
            })
          }}
        />
        <SettingsSelectorModal
          ref={settingsModalRef}
          settings={settings}
          onSettingsChange={values => {
            updateCustomChatSettings(id, values)
            dbUpdateCustomChatWhere(id, values)
            hapticSuccess()
          }}
          onDeleteAllMessageConfirm={async () => {
            try {
              await dbDeleteCustomChatMessageOfChatId(id)
              legacyResult.refetch()
              setFreshMessages([])
              hapticSuccess()
            } catch (e) {
              hapticWarning()
            }
          }}
          onShow={() => (enablekeyboardAvoid.value = false)}
          onDismiss={() => (enablekeyboardAvoid.value = true)}
        />
      </SafeAreaView>
    </BottomSheetModalProvider>
  )
}
