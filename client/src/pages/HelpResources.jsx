// client/src/pages/HelpResources.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function HelpResources() {
  const pageStyle = {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    lineHeight: '1.7',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  };
  const h2Style = {
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginTop: '30px',
  };
  const contactBoxStyle = {
    background: '#fffbeb',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    margin: '15px 0',
  };
  const dangerStyle = {
    background: '#fff0f0',
    border: '1px solid #fcc',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
  };

  return (
    <div style={pageStyle}>
      <h1>Help & Legal Resources Against Ragging</h1>

      <div style={dangerStyle}>
        <h3>IF YOU ARE IN IMMEDIATE DANGER</h3>
        <p>This platform is not an emergency service. If you or someone else is in immediate physical danger, please contact the Police immediately.</p>
        <h2 style={{ color: '#d00', margin: 0 }}>Call 119</h2>
      </div>

      <h2 style={h2Style}>What is Ragging? (The Law)</h2>
      <p>
        Ragging is a serious crime in Sri Lanka. It is defined and prohibited by the 
        <strong> Prohibition of Ragging and Other Forms of Violence in Educational Institutions Act, No. 20 of 1998</strong>.
      </p>

      {/* --- THIS IS THE FIX --- */}
      <p>
        Under this law, ragging includes (but is not limited to):
      </p>
      <ul> {/* The list is now a sibling, not a child, of the <p> tag */}
        <li>Any act that causes, or is likely to cause, physical or mental harm or fear.</li>
        <li>Forced sexual activity, sexual harassment, or verbal abuse.</li>
        <li>Forced consumption of food or drink.</li>
        <li>Criminal intimidation, extortion, or forced confinement.</li>
      </ul>
      {/* --- END OF FIX --- */}

      <p>
        Being found guilty of ragging is a criminal offense and can lead to <strong>up to ten (10) years of rigorous imprisonment</strong> and expulsion from your university.
      </p>

      <h2 style={h2Style}>Who To Contact Immediately</h2>
      <p>Do not wait. Report the incident as soon as possible to one or more of these authorities.</p>

      <div style={contactBoxStyle}>
        <h3>1. Sri Lanka Police</h3>
        <p>For any criminal act, including physical assault, threats, or extortion.</p>
        <p><strong>National Emergency Hotline:</strong> 119</p>
        <p><strong>Police Emergency (Colombo):</strong> 0112433333</p>
      </div>

      <div style={contactBoxStyle}>
        <h3>2. University Grants Commission (UGC)</h3>
        <p>The UGC has a dedicated 24/7 hotline specifically for reporting ragging incidents in universities.</p>
        <p><strong>UGC Anti-Ragging Hotline:</strong> 0112123700</p>
      </div>

      <div style={contactBoxStyle}>
        <h3>3. Your University Administration</h3>
        <p>You must report the incident to your university officials. They have a legal duty to act.</p>
        <ul>
          <li><strong>The Vice-Chancellor's Office</strong></li>
          <li><strong>The Dean of your Faculty</strong></li>
          <li><strong>The University Marshal or Security Office</strong></li>
          <li><strong>Your Student Counselor or Mentor</strong></li>
        </ul>
        <p>You can find these specific contact numbers on your university's official website.</p>
      </div>

      <div style={contactBoxStyle}>
        <h3>4. Human Rights Commission of Sri Lanka (HRCSL)</h3>
        <p>If you feel your fundamental rights have been violated, you can file a complaint with the HRCSL.</p>
        <p><strong>HRCSL Hotline:</strong> 0112505575</p>
      </div>

      <h2 style={h2Style}>What to do when reporting</h2>
      <ul>
        <li><strong>Be clear and factual.</strong> State what happened, where it happened, when it happened, and who was involved (if you know).</li>
        <li><strong>Preserve evidence.</strong> If you have threatening messages, photos, or videos, save them securely. Do not delete them.</li>
        <li><strong>Write down everything.</strong> Keep a private record of every incident, including dates, times, and locations.</li>
        <li><strong>Report as a group.</strong> If you were not the only victim, try to report with others. There is strength in numbers.</li>
      </ul>
    </div>
  );
}