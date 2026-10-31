import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useStore from '../../store/useStore.js';
import { ISLANDS } from '../../config/islands.js';

function AboutCard() {
  return (
    <div className='content-card'>
      <div className='tag'>About Me</div>
      <h2>Full-stack engineer who owns it end to end.</h2>
      <p>
        Hi, I'm Rishabh — a software engineer based in Gurugram, India. Since
        2020 I've built products from the database to the pixel: React and
        TypeScript up front, C#/.NET, Java, Python and Node behind them.
      </p>
      <p>
        I've built a research platform from scratch at Polybee, shipped 10+
        releases of an enterprise planning tool at PDWare, and replaced a
        $20K-a-month vendor tool at Walmart. Now, as a Senior AI Engineer at MKS
        PAMP, I'm putting that range to work on AI tools that take real hours
        out of people's week.
      </p>
      <p>
        Away from the keyboard, I'm usually playing guitar or at the gym. Both
        reward the same thing good software does: showing up every day and
        getting a little better.
      </p>
    </div>
  );
}

function SkillsCard() {
  const groups = [
    {
      label: 'Frontend / Design',
      skills: [
        'JavaScript',
        'TypeScript',
        'HTML',
        'CSS',
        'React / Redux',
        'Next.js',
        'Chart.js',
        'Three.js',
        'Figma',
      ],
    },
    {
      label: 'Backend / Database',
      skills: [
        'Bun',
        'Node.js',
        'C# (.NET)',
        'Java',
        'Python',
        'PostgreSQL',
        'AWS',
      ],
    },
    {
      label: 'Other',
      skills: ['Git', 'Jira', 'Jenkins', 'Postman'],
    },
  ];
  return (
    <div className='content-card'>
      <div className='tag'>What I Do</div>
      <h2>Tools & skills I bring to every project.</h2>
      <div className='skill-groups'>
        {groups.map((g) => (
          <div key={g.label} className='skill-group'>
            <h3>{g.label}</h3>
            <div className='skill-list'>
              {g.skills.map((s) => (
                <div key={s} className='skill-item'>
                  {s}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceCard() {
  const jobs = [
    {
      year: '2026 –',
      title: 'Senior AI Engineer',
      place: 'MKS PAMP Group · Gurugram, India',
    },
    {
      year: '2024 – 26',
      title: 'Software Engineer',
      place: 'PDWare · New York, US',
    },
    {
      year: '2023 – 24',
      title: 'Software Engineer',
      place: 'Polybee · New York, US',
    },
    {
      year: '2022 – 23',
      title: 'Software Engineer',
      place: 'Walmart · Arkansas, US',
    },
    {
      year: '2020 – 21',
      title: 'Software Engineer',
      place: 'Oyo · Bangalore, India',
    },
  ];
  return (
    <div className='content-card'>
      <div className='tag'>Experience</div>
      <h2>Places I've shaped pixels & pushed code.</h2>
      <div className='experience-list'>
        {jobs.map((j) => (
          <div key={j.place} className='exp-item'>
            <div className='exp-year'>{j.year}</div>
            <div className='exp-details'>
              <h4>{j.title}</h4>
              <span>{j.place}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactCard() {
  const contacts = [
    {
      icon: '✉️',
      label: 'Email',
      value: 'rishabhguha98@gmail.com',
      href: 'mailto:rishabhguha98@gmail.com',
      copy: 'rishabhguha98@gmail.com',
    },
    {
      icon: '💻',
      label: 'GitHub',
      value: 'https://github.com/rishabhguha',
      href: 'https://github.com/rishabhguha',
    },
  ];
  const [toastKey, setToastKey] = useState(0);
  const toastTimer = useRef();

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // copy without blocking the mailto: hand-off; the toast only shows if the
  // write actually succeeded (clipboard needs a secure context)
  const copyToClipboard = (text) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        // a fresh key remounts the toast, so repeat clicks replay the animation
        setToastKey((k) => k + 1);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastKey(0), 2000);
      })
      .catch(() => {});
  };

  return (
    <div className='content-card'>
      <div className='tag'>Get in Touch</div>
      <h2>Let's build something bright together.</h2>
      <p>
        Open to freelance collaborations, creative projects, and wild ideas.
        Don't be shy — say hello!
      </p>
      <div className='contact-grid'>
        {contacts.map((c) => (
          <a
            key={c.label}
            className='contact-item'
            href={c.href}
            // mailto: hands off to the mail app; a new tab would just sit blank
            {...(c.href.startsWith('mailto:')
              ? {}
              : { target: '_blank', rel: 'noopener noreferrer' })}
            onClick={c.copy ? () => copyToClipboard(c.copy) : undefined}
          >
            <div className='contact-icon'>{c.icon}</div>
            <h4>{c.label}</h4>
            <p>{c.value}</p>
          </a>
        ))}
      </div>
      {/* portalled: the card's transform would otherwise trap position: fixed */}
      {toastKey > 0 &&
        createPortal(
          <div key={toastKey} className='toast' role='status'>
            Copied to clipboard
          </div>,
          document.body
        )}
    </div>
  );
}

// keyed by island id rather than array position, so card order can never drift
// out of sync with the island config
const CARDS = {
  about: AboutCard,
  skills: SkillsCard,
  experience: ExperienceCard,
  contact: ContactCard,
};

export default function IslandOverlay() {
  const cardOpen = useStore((s) => s.cardOpen);
  const currentIsland = useStore((s) => s.currentIsland);
  const closeCard = useStore((s) => s.closeCard);
  const cardRef = useRef();

  useEffect(() => {
    if (!cardOpen) return;
    const onMouseDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        closeCard();
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [cardOpen, closeCard]);

  return (
    <div className={`island-overlay${cardOpen ? ' card-open' : ''}`}>
      {ISLANDS.map((island, i) => {
        const Card = CARDS[island.id];
        const isActive = cardOpen && currentIsland === i;
        return (
          <div
            key={island.id}
            className={`island-content${isActive ? ' visible' : ''}`}
          >
            <div ref={isActive ? cardRef : null}>
              <Card />
            </div>
          </div>
        );
      })}
    </div>
  );
}
