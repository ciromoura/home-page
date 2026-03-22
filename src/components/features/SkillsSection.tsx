'use client'

import { useEffect, useState } from 'react'
import { skills } from '@/data/skills'

export default function SkillsSection() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div id="skillsContainer" className="skills-container">
      {skills.map(skill => (
        <div key={skill.nome} className="skill">
          <label>{skill.nome}</label>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: animated ? `${skill.nivel}%` : '0%' }}
            />
          </div>
          <span className="skill-level">{skill.nivel_class}</span>
        </div>
      ))}
    </div>
  )
}
