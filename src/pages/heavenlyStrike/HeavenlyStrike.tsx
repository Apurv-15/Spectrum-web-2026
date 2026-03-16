import EventLayout from "../components/eventLayout/EventLayout";

export default function HeavenlyStrike() {
  return (
    <EventLayout
      day="DAY 1"
      date="1st April 2026"
      title="THE HEAVENLY STRIKE"
      tagline="One Breath. One Cut."
      type="BATTLE"
      accent="#ff2200"
      overview="The path of honor — fast, brutal, and precise. Coders face intense 1v1 knockout duels. One breath, one cut — the last standing Samurai claims the BLACK KATANA. This game rewards those who can solve, adapt, and build under pressure."
      eligibility={[
        "Open to all registered participants.",
        "Participants may compete individually or in teams of two (pairs).",
        "Team size cannot exceed 2 members.",
        "Participation format (solo/team) cannot be changed after registration.",
      ]}
      rounds={[
        {
          name: "KOMODA BEACH",
          difficulty: "Easy",
          duration: "15 min",
          description: "Mass sprint. Fix a simple buggy code snippet. Test your code comprehension and attention to detail.",
          details: [
            "USE OF MOUSE NOT ALLOWED — keyboard only.",
            "Objective: Test code comprehension and attention to detail.",
          ],
        },
        {
          name: "THE STANDOFF",
          difficulty: "Easy + Moderate",
          duration: "15 min",
          description: "Consists of 2 DSA rounds. Solve basic DSA problems under mild uncertainty with distractions.",
          details: [
            "Assess foundational problem-solving skills.",
            "Distractions will be introduced during this round.",
          ],
        },
        {
          name: "DUEL OF SAKAI",
          difficulty: "Final Round",
          duration: "20 min",
          description: "MVP Build Challenge. Build a Minimum Viable Product for a given real-world problem statement.",
          details: [
            "Test real-world application of technical, creative, and product-thinking skills.",
            "Distractions will be introduced during this round.",
            "Creativity and execution are key differentiators.",
          ],
        },
      ]}
      scoring={[
        { label: "Correctness of solution", weight: "25%" },
        { label: "Efficiency & optimization", weight: "25%" },
        { label: "Code quality & clarity", weight: "20%" },
        { label: "Adaptability to obstacles", weight: "15%" },
        { label: "Speed of completion", weight: "15%" },
      ]}
      prizes={[
        { rank: "1st Place", reward: "₹8,000 + Katana" },
        { rank: "Runner Up", reward: "₹5,000" },
      ]}
      rulesAllowed={[
        "Use of permitted IDEs/tools.",
        "Discussion within teams (if participating in pairs).",
        "Clarification from organizers (no hints).",
        "Standard debugging and coding practices.",
      ]}
      rulesNotAllowed={[
        "Plagiarism or copying code.",
        "Unauthorized internet browsing.",
        "Use of unauthorized AI tools.",
        "Sharing solutions between teams.",
        "Switching teams mid-event.",
        "External assistance of any kind.",
      ]}
            registrationLink="https://unstop.com/p/the-heavenly-strike-google-developer-groups-on-campus-vit-mumbai-1656097"
      registrationLabel="Register on Unstop"
      disqualification={[
        "Cheating or plagiarism.",
        "Use of unauthorized tools/devices.",
        "Misconduct or misbehavior.",
        "Violation of time constraints or fixture rules.",
        "Attempt to manipulate results.",
      ]}
    />
  );
}
