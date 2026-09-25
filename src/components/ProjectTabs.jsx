import { useRef, useState } from 'react';
import ProjectList from './ProjectList.jsx';

const TABS = [
  { id: 'selected', label: 'Selected' },
  { id: 'ongoing', label: 'Ongoing' },
];

export default function ProjectTabs({ projects }) {
  const [active, setActive] = useState(TABS[0].id);
  const tabRefs = useRef([]);

  const visible = projects.filter((project) => project.category === active);

  // Roving tabindex: arrows move between tabs, Home/End jump to the ends.
  function onKeyDown(event) {
    const current = TABS.findIndex((tab) => tab.id === active);
    let next = null;

    if (event.key === 'ArrowRight') next = (current + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;

    event.preventDefault();
    setActive(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label="Project categories">
        {TABS.map((tab, index) => {
          const count = projects.filter(
            (project) => project.category === tab.id,
          ).length;
          const selected = tab.id === active;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className="tabs__tab"
              onClick={() => setActive(tab.id)}
              onKeyDown={onKeyDown}
            >
              {tab.label}
              <span className="tabs__count">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        tabIndex={0}
        className="tabs__panel"
      >
        <ProjectList projects={visible} empty="Nothing in here yet." />
      </div>
    </div>
  );
}
