import { useState } from 'react'
import { fluentEmojiUrl } from '../utils/fluentEmoji'

const PetFace = ({ emoji }) => {
  const [errored, setErrored] = useState(false)
  if (!emoji) return null
  if (errored) {
    return (
      <span
        className="text-[52px] sm:text-[64px] leading-none inline-block"
        aria-hidden="true"
      >
        {emoji}
      </span>
    )
  }
  return (
    <img
      src={fluentEmojiUrl(emoji)}
      alt=""
      aria-hidden="true"
      onError={() => setErrored(true)}
      className="w-[52px] h-[52px] sm:w-16 sm:h-16 inline-block select-none object-contain"
      draggable={false}
    />
  )
}

export default PetFace
