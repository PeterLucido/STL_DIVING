export default function ProgramsContent() {
  return (
    <main><section className="programs-story-hero"><div className="wrap programs-story-grid"><div className="programs-hero-copy"><div className="eyebrow">Training Info</div><h1><span>How STL Diving</span><span>Training Works</span></h1><p className="lead">STL Diving is one team program with multiple training environments: 1-meter, 3-meter, dryland, and tower/platform. Coaches choose the right boards, drills, and progressions for each athlete.</p><div className="actions"><a className="btn red" href="/signup">Sign Up</a><a className="btn" href="/contact">Ask a Question</a></div></div><div className="story-photo-stack"><div className="story-photo large"><img alt="Springboard diver ready position" src="/assets/photos/springboard-ready-position.jpg"/><span>1m foundation</span></div><div className="story-photo"><img alt="3-meter / board timing diver" src="/assets/photos/three-meter.jpg"/><span>3m information</span></div><div className="story-photo"><img alt="Indoor diving facility" src="/assets/photos/facility.jpg"/><span>Tower/platform</span></div></div></div></section>
<section className="story-section training-environments-section">
<div className="wrap">
<div className="training-environments-intro">
<span className="story-kicker">Training overview</span>
<h2>One program. Multiple training environments.</h2>
<p className="sub">1-meter, 3-meter, dryland, and platform/tower are parts of training inside one team environment — not separate sign-up tracks. Coaches introduce each area based on age, experience, confidence, goals, and safety readiness.</p>
</div>
<div className="training-photo-grid">
<article className="training-photo-card">
<img alt="Diver preparing on springboard" src="/assets/photos/springboard-ready-position.jpg"/>
<div className="training-card-copy">
<span className="mini-label">1m springboard</span>
<h3>1-Meter Springboard</h3>
<p>The foundation for many diving skills, including approach, hurdle, takeoff, body control, and clean entries.</p>
</div>
</article>
<article className="training-photo-card">
<img alt="Diver training from higher springboard" src="/assets/photos/three-meter.jpg"/>
<div className="training-card-copy">
<span className="mini-label">3m springboard</span>
<h3>3-Meter Springboard</h3>
<p>Introduced with coach guidance to develop timing, confidence, air awareness, and stronger takeoffs.</p>
</div>
</article>
<article className="training-photo-card">
<img alt="Dryland mats and training setup" src="/assets/photos/dryland-training.jpg"/>
<div className="training-card-copy">
<span className="mini-label">dryland + mechanics</span>
<h3>Dryland Training</h3>
<p>Used to teach body positions, shapes, spotting, strength, flexibility, and skill mechanics before taking skills to the water.</p>
</div>
</article>
<article className="training-photo-card feature-platform">
<img alt="Tower and platform training area" src="/assets/photos/platform.jpg"/>
<div className="training-card-copy">
<span className="mini-label">tower / platform</span>
<h3>Tower / Platform</h3>
<p>Tower/platform work may include simple coach-led drills, jumps, entries, and progressions. Skills and heights are added as the athlete is ready.</p>
</div>
</article>
</div>
</div>
</section>
<section className="story-section"><div className="wrap story-split"><div className="info-panel"><span className="story-kicker">How training starts</span><h3>Start with the athlete’s current experience.</h3><ul><li>Brand new divers learn entries, body position, approach, and board comfort.</li><li>High school athletes can focus on Missouri 1-meter list building and meet confidence.</li><li>Returning divers keep developing fundamentals while coaches introduce board-specific progressions when appropriate.</li><li>Tower/platform training may include simple, coach-led drills, jumps, and entries before any higher-level skills are considered.</li></ul></div><div className="info-panel"><span className="story-kicker">What families should know</span><h3>Simple registration steps.</h3><ul><li>USA Diving introductory athlete membership is required first for insurance.</li><li>Month-to-month training is handled through RecPlex registration.</li><li>Individual drop-ins use a separate RecPlex sign-in/payment flow.</li><li>If you are unsure where to start, remember that STL Diving coaches guide the training plan after sign-up.</li></ul></div></div></section>
<section className="story-section"><div className="wrap"><span className="story-kicker">Costs to know</span><h2>Insurance first, then choose the session flow.</h2><div className="price-grid"><div className="price-card"><b>USA Diving insurance</b><strong>$22</strong><span>Introductory Athlete 17U or AQUA Age 18+ before pool participation.</span></div><div className="price-card"><b>Monthly registration</b><strong>$280/month</strong><span>Includes 8 practices per month at $35/session through RecPlex.</span></div><div className="price-card"><b>Drop-in practice</b><strong>$40/session</strong><span>Individual drop-in practice through the RecPlex drop-in flow.</span></div></div></div></section>
<section className="story-section"><div className="wrap"><div className="programs-cta"><div><h2>Ready to come dive?</h2><p>Complete the sign-up steps or ask a quick question about how STL Diving practices work.</p></div><div className="actions"><a className="btn red" href="/signup">Sign Up Instructions</a><a className="btn" href="/contact">Request Intro Practice</a></div></div></div></section>
<section className="section bottom-contact-form final-start-form"><div className="wrap contact-bottom-grid"><div><span className="tag">Get Started</span><h2>Request an Intro Practice</h2><p className="sub">Send the athlete’s age, experience level, goals, and best practice days. STL Diving will follow up with the best next step. <span className="inline-fee-note">*$22 USA Diving insurance/membership fee required before pool participation.</span></p><div className="actions form-intro-actions"><a className="btn primary" href="/signup">Sign Up Instructions</a></div></div><form className="form session-form" action="https://formsubmit.co/info@stldiving.com" method="POST"><input name="_subject" type="hidden" value="STL Diving Website Request"/><input name="_template" type="hidden" value="table"/><input name="_captcha" type="hidden" value="false"/><div className="form-grid"><div><label>Parent or athlete name</label><input name="name" placeholder="Name"/></div><div><label>Email</label><input name="email" placeholder="Email address"/></div><div><label>Phone</label><input name="phone" placeholder="Phone number (optional)"/></div><div><label>Contact reason</label><select name="contact_reason"><option>Request an intro practice</option><option>Training question</option><option>Sign-up help</option><option>Coaching question</option><option>Other question</option></select></div><div><label>Athlete level</label><select name="athlete_level"><option>New to diving</option><option>Summer league / beginner</option><option>Middle school or high school</option><option>Club or competitive experience</option></select></div><div><label>Diving interest</label><select name="diving_interest"><option>Starting diving</option><option>Returning diver</option><option>High school prep</option><option>General question</option></select></div></div><label>Message</label><textarea name="message" placeholder="Tell us age, goals, experience, and preferred days/times."></textarea><button className="btn red" type="submit">Send Request</button></form></div></section></main>
  );
}
