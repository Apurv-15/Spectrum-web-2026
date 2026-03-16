import EventLayout from "../components/eventLayout/EventLayout";

export default function WayOfGhost() {
  return (
    <EventLayout
      day="DAY 3"
      date="3rd April 2026"
      title="THE WAY OF THE GHOST"
      tagline="Survive the grid. Outsmart the ghost."
      type="STRATEGY"
      accent="#9b4dff"
      overview="The Way of the Ghost is a high-intensity DSA competition that combines coding battles, technical quizzes, and a live-time bidding showdown. It tests your speed, accuracy, strategy, and technical knowledge through progressive elimination rounds. It's not just about coding — it's about surviving THE GRID. Teams of 2. Platform: GeeksforGeeks IDE."
      eligibility={[
        "Open to all students.",
        "Team event — teams of 2 members.",
        "Register through the official Google Form.",
      ]}
      rounds={[
        {
          name: "SHADOW TACTICS",
          difficulty: "Bluffing Round",
          duration: "15 min per duel",
          description: "40 teams → 20 teams. 1v1 coding duel with a bluff-based strategy. You have 60 seconds to deceive your opponent before a 15-minute solve window.",
          details: [
            "Must solve the problem within 15 minutes.",
            "Success → advance. Failure → opponent advances.",
            "Pure elimination round — no second chances.",
          ],
        },
        {
          name: "THE SHRINE OF WISDOM",
          difficulty: "Tech Quiz",
          description: "20 teams → 10 teams. Platform: Kahoot. Covers CS fundamentals, programming concepts, debugging logic, systems & web basics, and tech history & trends.",
          details: [
            "Judged on speed and accuracy.",
            "Top 10 teams on leaderboard qualify.",
            "Platform-based scoring ensures objectivity.",
          ],
        },
        {
          name: "THE KHAN'S ULTIMATUM",
          difficulty: "Auction Finale",
          description: "Top 10 teams compete. Teams bid the time they need to solve each problem. The lowest bidder codes live. 5 problems total — team with the highest Bits wins.",
          details: [
            "Success awards +100 Bits per problem.",
            "Failure within bid time → immediate elimination.",
            "If previous team fails, other teams can attempt to steal the problem.",
            "Strategy and realistic bidding are crucial.",
          ],
        },
      ]}
      scoring={[
        { label: "Round 1 — Shadow Tactics", weight: "30%" },
        { label: "Round 2 — Shrine of Wisdom", weight: "20%" },
        { label: "Round 3 — Khan's Ultimatum", weight: "50%" },
      ]}
      prizes={[
        { rank: "1st Place", reward: "₹6,000 + GDG Goodies" },
        { rank: "1st Runner Up", reward: "₹4,000 + GDG Goodies" },
        { rank: "2nd Runner Up", reward: "₹2,000 + GDG Goodies" },
      ]}
      rulesAllowed={[
        "Team discussion within your 2-member team.",
        "Strategic bluffing in Round 1.",
        "Bidding realistically in Round 3.",
        "Competing only via the official GFG IDE.",
        "Attempting to steal problems in Round 3 (if previous team fails).",
      ]}
      rulesNotAllowed={[
        "External help from audience or other teams.",
        "Using unauthorized platforms/tools outside GFG.",
        "Collaboration between different teams.",
        "Misconduct, unfair practices, or rule violations.",
        "Deliberate disruption of the competition.",
        "Switching team members after registration.",
      ]}
            registrationLink="https://unstop.com/p/the-way-of-the-ghost-google-developer-groups-on-campus-vit-mumbai-1656118"
      registrationLabel="Register on Unstop"
      disqualification={[
        "Found using unfair means or external help.",
        "Violating platform rules or tampering with system settings.",
        "Failing to adhere to time constraints.",
        "Engaging in misconduct or disruptive behavior.",
        "In Round 3, failure to solve within bid time → immediate elimination.",
      ]}
    />
  );
}
