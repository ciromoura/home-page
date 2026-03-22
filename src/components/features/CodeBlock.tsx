'use client'

import { useState } from 'react'

interface Props {
  lang: string
  /** Pre-highlighted HTML (safe: authored content, not user input) */
  html: string
}

export default function CodeBlock({ lang, html }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const tmp = document.createElement('pre')
    tmp.innerHTML = html
    navigator.clipboard.writeText(tmp.innerText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="code-wrap">
      <div className="code-header">
        <span className="code-lang">{lang}</span>
        <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
          {copied ? 'copiado ✓' : 'copiar'}
        </button>
      </div>
      <pre dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
