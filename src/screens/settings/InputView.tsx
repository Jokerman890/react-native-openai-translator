import { InputModal } from '../../components/InputModal'
import { SvgIcon } from '../../components/SvgIcon'
import { dimensions } from '../../res/dimensions'
import { useTextThemeStyle, useThemeColor } from '../../themes/hooks'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native'

export interface InputViewProps {
  style?: StyleProp<ViewStyle>
  securable?: boolean
  value: string
  modalTitle: string
  onChangeText: (value: string) => void
}

export function InputView(props: InputViewProps) {
  const { style, securable, value, modalTitle, onChangeText } = props

  const { t } = useTranslation()

  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  const textStyle = useTextThemeStyle('text')
  const iconColor = useThemeColor('tint')
  const backgroundColor = useThemeColor('backdrop2')

  const text = securable && secureTextEntry ? '·'.repeat(Math.min(value.length, 24)) : value
  const letterSpacing = securable && secureTextEntry ? 3 : 0
  const fontWeight = securable && secureTextEntry ? 'bold' : 'normal'
  return (
    <>
      <Pressable
        style={[styles.container, { backgroundColor }, style]}
        onPress={() => setModalVisible(true)}>
        <Text
          style={[styles.text, { letterSpacing, fontWeight }, textStyle]}
          numberOfLines={1}
          lineBreakMode="head">
          {text}
        </Text>
        {securable ? (
          <Pressable
            style={styles.secure}
            hitSlop={{
              left: 4,
              top: dimensions.edge,
              right: dimensions.edge,
              bottom: dimensions.edge,
            }}
            onPress={() => setSecureTextEntry(!secureTextEntry)}>
            <SvgIcon
              size={dimensions.iconSmall}
              color={iconColor}
              name={secureTextEntry ? 'visibility' : 'visibility-off'}
            />
          </Pressable>
        ) : null}
      </Pressable>
      <InputModal
        visible={modalVisible}
        title={modalTitle}
        initialValue={value}
        securable={securable}
        leftText={t('CANCEL')}
        rightText={t('CONFIRM')}
        onRightPress={onChangeText}
        onDismissRequest={setModalVisible}
      />
    </>
  )
}

type Styles = {
  container: ViewStyle
  text: TextStyle
  secure: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 42,
    marginTop: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  text: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    marginLeft: dimensions.edge,
  },
  secure: {
    marginLeft: 11,
    marginRight: 11,
  },
})
