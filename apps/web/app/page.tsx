export default function Home() {
  return (
    <div className="dashboard">
      <section className="hero-card reveal">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="hero-title">A shared space for tiny moments.</h2>
          <p className="hero-copy">
            Capture notes, track training, and curate the places you want to go
            together.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn primary">Add a note</button>
          <button className="btn ghost">Plan a trip</button>
        </div>
      </section>

      <section className="grid-two">
        <div className="card reveal">
          <div className="card-header">
            <h3>Message of the day</h3>
            <span className="badge">for you</span>
          </div>
          <p className="card-body">
            "Proud of your consistency this week. Lets do a sunset run on
            Saturday?"
          </p>
          <p className="card-meta">From Lia · 2 hours ago</p>
        </div>
        <div className="card reveal">
          <div className="card-header">
            <h3>Upcoming plans</h3>
            <span className="badge">3 items</span>
          </div>
          <ul className="list">
            <li>Kyoto temple walk · March</li>
            <li>Homemade ramen night · Friday</li>
            <li>Strength session · Sunday</li>
          </ul>
        </div>
      </section>

      <section className="grid-three">
        <div className="card reveal">
          <div className="card-header">
            <h3>Recent notes</h3>
            <span className="badge">6</span>
          </div>
          <ul className="list">
            <li>Buy film for the weekend trip.</li>
            <li>Remember: basil for the pasta.</li>
            <li>Look into a new climbing gym.</li>
          </ul>
        </div>
        <div className="card reveal">
          <div className="card-header">
            <h3>Trainings</h3>
            <span className="badge">This week</span>
          </div>
          <ul className="list">
            <li>Intervals · 35 min · RPE 7</li>
            <li>Upper body · 50 min · RPE 6</li>
            <li>Yoga · 30 min · RPE 4</li>
          </ul>
        </div>
        <div className="card reveal">
          <div className="card-header">
            <h3>Places visited</h3>
            <span className="badge">Last 30 days</span>
          </div>
          <ul className="list">
            <li>Lake Zurich promenade</li>
            <li>Old Town coffee walk</li>
            <li>Museum night</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
