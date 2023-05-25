import { dimensions } from '../../../res/dimensions'
import { stylez } from '../../../res/stylez'
import { useThemeScheme } from '../../../themes/hooks'
import React, { useImperativeHandle, useState } from 'react'
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native'

export interface OutputViewProps {
  style?: StyleProp<TextStyle>
  assistantText: string | null
  text: string
}

export interface OutputViewHandle {
  updateText: (text: string) => void
}

export const OutputView = React.forwardRef<OutputViewHandle, OutputViewProps>((props, ref) => {
  const { style, assistantText, text } = props
  const { text: textColor, text3: text3Color } = useThemeScheme()
  const color = text !== assistantText ? text3Color : textColor

  const [displayText, setDisplayText] = useState('')
  const [preText, setPreText] = useState(text)
  if (text !== preText) {
    setPreText(text)
    setDisplayText(text)
  }

  useImperativeHandle(ref, () => ({
    updateText: setDisplayText,
  }))

  return (
    <Text selectable style={[stylez.contentText, styles.text, { color }, style]}>
      {displayText}
    </Text>
  )
})

type Styles = {
  text: TextStyle
}

const styles = StyleSheet.create<Styles>({
  text: {
    width: '100%',
    textAlign: 'justify',
    paddingHorizontal: dimensions.edgeTwice,
    padding: 0,
  },
})
