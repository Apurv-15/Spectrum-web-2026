import EventLayout from "../components/eventLayout/EventLayout";

export default function Invasion() {
  return (
    <EventLayout
      day="DAY 4"
      date="4th April 2026"
      title="THE INVASION"
      tagline="Hack the Ghost. ₹40,000 Prize Pool."
      type="HACKATHON"
      accent="#ff4d00"
      overview="This is not just a hackathon — it is a battleground for innovators. THE INVASION: Hack the Ghost is a premier hybrid software development challenge designed to bring together aspiring developers and problem-solvers. Brought to you by Google Developer Group, VIT Mumbai × Google Developer Group, UMIT. The siege begins with an online ideation round. The top surviving teams will be summoned to the VIT Mumbai campus for an intense offline coding finale. Gather your clan, collaborate under real-world constraints, build impactful solutions from scratch, and claim your share of the massive ₹40,000 prize pool!"
      registrationLink="https://tinyurl.com/4etp7z8e"
      registrationLabel="Register for Hackathon"
      eligibility={[
        "Open to all students — beginners and experienced developers alike.",
        "Team-based participation.",
        "Round 1 is completely free to enter.",
        "₹500 registration fee only for teams qualifying to Round 2 (offline finale).",
      ]}
      rounds={[
        {
          name: "ONLINE PRESENTATION SUBMISSION",
          difficulty: "Ideation Phase — Free Entry",
          description: "Participants receive a common problem statement and must submit a clear, well-structured presentation outlining their core idea, proposed solution, and expected impact.",
          details: [
            "Format: Concise slide deck (5-7 slides) submitted as PDF only.",
            "Naming: TeamName_ProblemStatement_Presentation.pdf",
            "Plagiarism Policy: 100% original work, references must be cited, similarity below 10-15%. Plagiarism = immediate disqualification.",
            "Evaluation: Innovation (25%), Problem Clarity (20%), Feasibility (20%), Impact & Scalability (20%), Presentation Quality (15%).",
          ],
        },
        {
          name: "OFFLINE FINALE AT VIT CAMPUS",
          difficulty: "On-site Hacking Challenge — ₹500 Fee",
          description: "Shortlisted teams report to the Vidyalankar Institute of Technology campus for an intense offline coding challenge. Problem statements are revealed 48 hours before the event to give teams time to strategize.",
          details: [
            "Problem statements released exactly 48 hours prior to the offline round.",
            "₹500 registration fee required for qualifying teams.",
            "Develop solutions within the given time frame under live evaluation.",
            "Amenities provided: food, seating, internet access, and power infrastructure.",
          ],
        },
      ]}
      scoring={[
        { label: "Innovation", weight: "25%" },
        { label: "Problem Clarity", weight: "20%" },
        { label: "Feasibility", weight: "20%" },
        { label: "Impact & Scalability", weight: "20%" },
        { label: "Presentation Quality", weight: "15%" },
      ]}
      prizes={[
        { rank: "Prize Pool", reward: "₹40,000" },
      ]}
      rulesAllowed={[
        "Team collaboration and discussion.",
        "Use of any programming language or framework.",
        "Internet access for research and development.",
        "Consulting documentation and open-source resources.",
      ]}
      rulesNotAllowed={[
        "Submitting plagiarized or pre-built solutions.",
        "Using unauthorized AI tools for code generation.",
        "Misrepresenting team members or qualifications.",
        "Tampering with other teams' work.",
        "Violating the code of conduct.",
      ]}
      disqualification={[
        "Plagiarism detected in presentation or code.",
        "Failure to meet submission format requirements.",
        "Misconduct during the offline finale.",
        "Violation of any stated rules or guidelines.",
      ]}
    >
      <section style={{ marginBottom: "60px" }}>
        <h2 style={{
          fontFamily: '"Japan Ramen", sans-serif',
          fontSize: "clamp(20px, 3vw, 28px)",
          letterSpacing: "0.08em",
          color: "#ff4d00",
          marginBottom: "20px",
          paddingBottom: "10px",
          borderBottom: "1px solid rgba(255, 223, 208, 0.1)",
        }}>
          Themes & Domains
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
        }}>
          {["Web Development", "Mobile App Development", "Blockchain Development", "No-Code / Low-Code Innovation"].map(
            (theme) => (
              <div
                key={theme}
                style={{
                  border: "1px solid rgba(255, 77, 0, 0.2)",
                  padding: "20px",
                  textAlign: "center",
                  background: "rgba(255, 77, 0, 0.03)",
                  fontFamily: '"Shippori Mincho", serif',
                  fontSize: "14px",
                  color: "rgba(255, 223, 208, 0.7)",
                }}
              >
                {theme}
              </div>
            )
          )}
        </div>
      </section>
    </EventLayout>
  );
}
