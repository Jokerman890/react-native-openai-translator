import { TitleBar } from '../../components/TitleBar'
import { AssistantMessageView } from '../../components/chat/AssistantMessageView'
import { InputBar } from '../../components/chat/InputBar'
import { SSEMessageView } from '../../components/chat/SSEMessageView'
import { UserMessageView } from '../../components/chat/UserMessageView'
import { hapticError, hapticSuccess } from '../../haptic'
import { useOpenAIApiCustomizedOptions, useOpenAIApiUrlOptions } from '../../http/apis/hooks'
import { sseRequestChatCompletions } from '../../http/apis/v1/chat/completions'
import { useHideChatAvatarPref } from '../../preferences/storages'
import { dimensions } from '../../res/dimensions'
import { useThemeScheme } from '../../themes/hooks'
import { toast } from '../../toast'
import { ChatMessage, Message } from '../../types'
import { useSSEMessageStore } from '../../zustand/stores/sse-message-store'
import type { RootStackParamList } from '../screens'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, View } from 'react-native'
import { KeyboardEvents, useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import EventSource from 'react-native-sse'

type Props = NativeStackScreenProps<RootStackParamList, 'CustomChat'>

export function CustomChatScreen({ route }: Props): JSX.Element {
  const { chatName, systemPrompt } = route.params

  const { urlOptions, checkIsOptionsValid } = useOpenAIApiUrlOptions()
  const customizedOptions = useOpenAIApiCustomizedOptions()

  const { backgroundChat: backgroundColor } = useThemeScheme()
  const [hideChatAvatar] = useHideChatAvatarPref()

  const { height: keyboardHeight } = useReanimatedKeyboardAnimation()
  const transformStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: keyboardHeight.value }] }
  }, [])

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // TODO Should query before navigate ?
    return []
  })
  const messagesInverted = useMemo(() => {
    return [...messages].reverse()
  }, [messages])

  const messageListRef = useRef<FlatList<ChatMessage>>(null)
  const scrollToTop = useCallback((delay = 200) => {
    const fn = () => messageListRef.current?.scrollToOffset({ offset: 0, animated: true })
    delay > 0 ? setTimeout(fn, delay) : fn()
  }, [])
  useEffect(() => {
    const show = KeyboardEvents.addListener('keyboardWillShow', () => scrollToTop(0))
    return () => show.remove()
  }, [messages.length])

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
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: inputText }]
    setMessages(nextMessages)

    const messagesToSend: Message[] = nextMessages.map(({ role, content }) => ({
      role,
      content,
    }))
    if (systemPrompt) {
      messagesToSend.push({ role: 'system', content: systemPrompt })
    }
    scrollToTop()
    setStatus('sending')
    esRequesting.current = true
    esRef.current?.close()
    esRef.current = sseRequestChatCompletions(urlOptions, customizedOptions, messagesToSend, {
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
        setMessages(prev => [...prev, { role: 'assistant', content: message.content }])
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

  const renderItemSeparator = () => <View style={{ height: dimensions.messageSeparator }} />

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['left', 'right']}>
      <TitleBar
        title={chatName}
        subtitle={systemPrompt}
        action={{
          iconName: 'tune',
          onPress: () => toast('success', 'Teaser', 'Chat fine-tuning will be support later'),
        }}
      />
      <View style={[{ flex: 1, overflow: 'hidden' }]}>
        <Animated.View style={[{ flex: 1 }, transformStyle]}>
          {/* 
            The FlashList with an inverted orientation has an incorrect location for the vertical scroll indicator on the left side. 
            Therefore, it should be replaced by a FlatList. 
          */}
          <FlatList
            ref={messageListRef}
            contentContainerStyle={{ paddingVertical: dimensions.messageSeparator }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            inverted={true}
            data={messagesInverted}
            keyExtractor={(item, index) => `${index}_${item.role}_${item.content}`}
            renderItem={({ item }) => {
              if (item.role === 'user') {
                return <UserMessageView hideChatAvatar={hideChatAvatar} message={item} />
              }
              if (item.role === 'assistant') {
                return <AssistantMessageView hideChatAvatar={hideChatAvatar} message={item} />
              }
              return null
            }}
            ItemSeparatorComponent={renderItemSeparator}
            ListHeaderComponent={<SSEMessageView hideChatAvatar={hideChatAvatar} />}
            onEndReached={() => console.log('onEndReached')}
          />
        </Animated.View>
      </View>
      <InputBar
        value={inputText}
        sendDisabled={sendDisabled}
        onChangeText={setInputText}
        onSendPress={onSendPress}
      />
    </SafeAreaView>
  )
}
