import { useEffect, useRef } from 'react'
import useStore from '../../store/useStore.js'
import { ISLANDS } from '../../config/islands.js'

function AboutCard() {
  return (
    <div className="content-card">
      <div className="tag">About Me</div>
      <h2>Creative developer crafting playful digital worlds.</h2>
      <p>
        Hi, I'm Rishabh — a multidisciplinary designer and developer based in
        Barcelona. I blend bold colors, smooth motion, and clean code to
        build experiences that feel alive.
      </p>
      <p>
        My work sits at the intersection of art and technology. From
        immersive 3D web experiences to vibrant brand identities, I believe
        great design should make people smile.
      </p>
    </div>
  )
}

function SkillsCard() {
  const skills = [
    'Three.js', 'React', 'WebGL',
    'Figma', 'Motion Design', 'GLSL Shaders',
    'TypeScript', 'Blender', 'Node.js',
  ]
  return (
    <div className="content-card">
      <div className="tag">What I Do</div>
      <h2>Tools & skills I bring to every project.</h2>
      <div className="skills-grid">
        {skills.map((s) => (
          <div key={s} className="skill-item">{s}</div>
        ))}
      </div>
    </div>
  )
}

function ExperienceCard() {
  const jobs = [
    { year: '2024 –', title: 'Senior Creative Developer', place: 'Studio Particular · Barcelona' },
    { year: '2022 – 24', title: 'Interactive Developer', place: 'Resn · Amsterdam' },
    { year: '2020 – 22', title: 'Frontend Engineer', place: 'Active Theory · Los Angeles' },
    { year: '2018 – 20', title: 'Junior Developer', place: 'Locomotive · Montréal' },
  ]
  return (
    <div className="content-card">
      <div className="tag">Experience</div>
      <h2>Places I've shaped pixels & pushed code.</h2>
      <div className="experience-list">
        {jobs.map((j) => (
          <div key={j.title} className="exp-item">
            <div className="exp-year">{j.year}</div>
            <div className="exp-details">
              <h4>{j.title}</h4>
              <span>{j.place}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactCard() {
  const contacts = [
    { icon: '✉️', label: 'Email', value: 'hello@rishabh.studio' },
    { icon: '🐦', label: 'Twitter', value: '@rishabhcreates' },
    { icon: '📐', label: 'Dribbble', value: 'rishabh.dribbble' },
    { icon: '💻', label: 'GitHub', value: 'github/rishabh' },
  ]
  return (
    <div className="content-card">
      <div className="tag">Get in Touch</div>
      <h2>Let's build something bright together.</h2>
      <p>
        Open to freelance collaborations, creative projects, and wild ideas.
        Don't be shy — say hello!
      </p>
      <div className="contact-grid">
        {contacts.map((c) => (
          <div key={c.label} className="contact-item">
            <div className="contact-icon">{c.icon}</div>
            <h4>{c.label}</h4>
            <p>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// keyed by island id rather than array position, so card order can never drift
// out of sync with the island config
const CARDS = {
  about: AboutCard,
  skills: SkillsCard,
  experience: ExperienceCard,
  contact: ContactCard,
}

export default function IslandOverlay() {
  const cardOpen = useStore((s) => s.cardOpen)
  const currentIsland = useStore((s) => s.currentIsland)
  const closeCard = useStore((s) => s.closeCard)
  const cardRef = useRef()

  useEffect(() => {
    if (!cardOpen) return
    const onMouseDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        closeCard()
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [cardOpen, closeCard])

  return (
    <div className={`island-overlay${cardOpen ? ' card-open' : ''}`}>
      {ISLANDS.map((island, i) => {
        const Card = CARDS[island.id]
        const isActive = cardOpen && currentIsland === i
        return (
          <div key={island.id} className={`island-content${isActive ? ' visible' : ''}`}>
            <div ref={isActive ? cardRef : null}>
              <Card />
            </div>
          </div>
        )
      })}
    </div>
  )
}
