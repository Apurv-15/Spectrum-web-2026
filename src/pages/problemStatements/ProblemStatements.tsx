import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ProblemStatements.module.scss";
import BackButton from "../components/backButton/BackButton";

gsap.registerPlugin(ScrollTrigger);

interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  objective: string;
  keyFeatures: string[];
  expectedImpact: string[];
}

interface Domain {
  id: string;
  name: string;
  accent: string;
  problems: ProblemStatement[];
}

const DOMAINS: Domain[] = [
  {
    id: "app-web",
    name: "APP / WEB",
    accent: "#4d8eff",
    problems: [
      {
        id: "AW-01",
        title: "Mystic Mirror – AI-Powered Virtual Try-On for Indian E-Commerce",
        description:
          "Online fashion platforms often struggle to provide realistic visualization and accurate sizing, especially for diverse Indian body types and regional preferences. This results in low customer confidence, higher return rates, and reduced user satisfaction. There is a need for an intelligent system that enhances visualization and personalization while remaining practical for real-world implementation.",
        objective:
          "To develop a platform that enables users to virtually try on outfits using AI-assisted visualization and receive personalized fashion recommendations.",
        keyFeatures: [
          "Realistic AI-assisted virtual outfit preview",
          "Size and fit recommendation system based on user inputs",
          "Personalized outfit suggestions based on preferences",
          "Multilingual user interface support",
          "Interactive and responsive visualization interface",
          "Basic body measurement input or approximation system",
          "Vendor onboarding and catalog management system",
        ],
        expectedImpact: [
          "Improves customer confidence in online shopping",
          "Reduces return rates through better fit accuracy",
          "Enhances overall shopping experience",
        ],
      },
      {
        id: "AW-02",
        title: "Smart Multi-Modal Travel Planning & Disruption Management Platform",
        description:
          "Urban travelers rely on multiple modes of transport such as buses, metro, and walking, but often face delays, route changes, and lack of coordination between services. Existing systems provide static route suggestions but fail to adapt dynamically to disruptions. There is a need for a platform that intelligently plans and adjusts travel routes based on changing conditions.",
        objective:
          "To develop a platform that helps users plan optimal travel routes across multiple transport modes and adapts to delays, congestion, or disruptions using real-time or simulated data.",
        keyFeatures: [
          "Multi-modal route planning (bus, metro, walking, etc.)",
          "Real-time or simulated delay and disruption handling",
          "Dynamic route re-routing and alternative suggestions",
          "Estimated travel time calculation",
          "User preference-based routing (cost, time, transfers)",
          "Interactive map-based visualization with navigation support",
        ],
        expectedImpact: [
          "Reduces travel time and delays",
          "Improves route planning and efficiency",
          "Enhances commuting experience",
        ],
      },
      {
        id: "AW-03",
        title: "Hyper-Local Disaster Resilience Network",
        description:
          "Urban regions frequently face localized disasters such as floods, heatwaves, and infrastructure failures. However, existing systems lack timely, community-driven prediction and response mechanisms, leading to delayed actions and increased damage. There is a need for a platform that enables better awareness, reporting, and response using available or simulated data.",
        objective:
          "To develop a platform that predicts and manages localized disasters using available or simulated data and community participation.",
        keyFeatures: [
          "Real-time disaster prediction using multiple data sources (or simulated inputs)",
          "Geo-tagged community-based incident reporting system",
          "Alert and notification system for risk zones",
          "Visualization of affected areas on interactive maps",
          "Quick reporting interface for users",
          "Integration-ready architecture for external data sources",
          "Offline-capable functionality for low-connectivity scenarios",
        ],
        expectedImpact: [
          "Enables faster disaster response",
          "Improves preparedness and awareness",
          "Reduces potential damage and risks",
        ],
      },
      {
        id: "AW-04",
        title: "Smart Infrastructure Inspection & Compliance Platform",
        description:
          "Infrastructure inspections are often manual, time-consuming, and prone to human error, resulting in poor quality control and delays. There is a need for a digital system that simplifies inspection workflows, improves reporting accuracy, and enables better compliance tracking.",
        objective:
          "To create a platform that enables inspection and compliance monitoring using digital tools and AI-assisted analysis.",
        keyFeatures: [
          "Geo-tagged image and video capture for inspections",
          "AI-assisted defect identification (pre-trained or rule-based)",
          "Inspection workflow automation and task assignment",
          "Compliance tracking dashboard for monitoring status",
          "Report generation and documentation system",
          "Historical data tracking and comparison",
          "Mobile-friendly interface for field data collection",
        ],
        expectedImpact: [
          "Improves quality control and accuracy",
          "Reduces manual workload and errors",
          "Enhances efficiency and transparency",
        ],
      },
    ],
  },
  {
    id: "ai-ml",
    name: "AI / ML",
    accent: "#9b4dff",
    problems: [
      {
        id: "AI-01",
        title: "Advanced Voice Biometric Financial Inclusion Engine",
        description:
          "A large population still lacks access to banking due to absence of reliable identity systems and difficulty in using passwords or PINs. Existing voice-based systems are limited by noise, accent variations, and vulnerability to spoofing attacks, making secure authentication a challenge.",
        objective:
          "To develop an AI-powered voice biometric authentication system that enables secure, passwordless, and inclusive access to financial services using voice as the primary identity.",
        keyFeatures: [
          "Voice-based registration and authentication",
          "Accent- and dialect-independent speaker verification",
          "Liveness detection to prevent fraud",
          "AI-based fraud & anomaly detection",
          "Continuous authentication during sessions",
          "Fraud detection using voice patterns",
          "Offline/edge authentication capability",
        ],
        expectedImpact: [
          "Expands banking access to underserved populations",
          "Simplifies authentication for non-technical users",
          "Improves security and reduces fraud in financial systems",
        ],
      },
      {
        id: "AI-02",
        title: "AI-Powered Public Grievance Prioritization & Resolution System",
        description:
          "Government grievance portals receive thousands of complaints daily, but many critical issues (water, roads, safety) get delayed due to poor prioritization and manual handling.",
        objective:
          "To develop an AI system that automatically categorizes, prioritizes, and routes public complaints for faster resolution.",
        keyFeatures: [
          "NLP-based complaint classification (water, electricity, roads, etc.)",
          "Priority scoring based on urgency & impact",
          "Auto-routing to relevant departments",
          "Duplicate complaint detection",
          "Multilingual complaint support system",
          "Smart sentiment analysis for complaint urgency",
          "Citizen dashboard for status tracking",
        ],
        expectedImpact: [
          "Faster issue resolution",
          "Improved governance efficiency",
          "Increased public satisfaction",
        ],
      },
      {
        id: "AI-03",
        title: "AI-Based Disaster Detection System",
        description:
          "Manual disaster analysis is slow and inefficient. An AI-based system is needed that uses AI/ML models for faster and more accurate disaster detection.",
        objective:
          "To build an AI system that detects disasters (floods, wildfires, deforestation) using AI/ML models trained on vast data available across the internet, allowing flexibility to use text or image-based data.",
        keyFeatures: [
          "AI/ML-based disaster detection",
          "Integration of satellite data",
          "Ability to use diverse data sources (text, images, etc.)",
          "Geo-mapping of affected areas",
          "Early warning system with automated multi-channel alerts",
          "Edge AI for low-latency detection in remote areas",
          "Integration with emergency services for instant dispatch",
        ],
        expectedImpact: [
          "Faster disaster detection and reduced manual effort",
          "Improved response time and decision-making",
          "Scalable and flexible solution for real-world disaster management",
        ],
      },
      {
        id: "AI-04",
        title: "Multimodal Deepfake Detection & Trust Engine",
        description:
          "With the rise of generative AI, deepfake videos, audios, and images are increasingly used for misinformation, fraud, and identity manipulation. Existing systems often fail to detect sophisticated, multimodal deepfakes in real time.",
        objective:
          "To develop an AI-powered system that detects deepfakes across video, audio, and image formats using multimodal learning.",
        keyFeatures: [
          "Multimodal deepfake detection (audio + video + image)",
          "Real-time authenticity scoring",
          "Confidence scoring with risk classification levels",
          "Cross-platform real-time scanning (social media, web uploads)",
          "Explainable AI (highlight manipulated regions)",
          "Browser plugin / API for verification",
          "Continuous learning with new deepfake patterns",
        ],
        expectedImpact: [
          "Reduces spread of misinformation and fake news",
          "Enhances trust in digital media and online content",
          "Prevents financial fraud and identity theft",
        ],
      },
    ],
  },
  {
    id: "blockchain",
    name: "BLOCKCHAIN",
    accent: "#00d4aa",
    problems: [
      {
        id: "BC-01",
        title: "ZKP-Based Consumer Data Marketplace & Monetization Platform",
        description:
          "In the current digital ecosystem, large corporations harvest and monetize user data without providing compensation or preserving privacy. Users need a way to reclaim sovereignty over their data, proving their demographic traits to advertisers or researchers without exposing their raw, underlying personal information.",
        objective:
          "To build a decentralized, blockchain-based data marketplace where users can selectively monetize their data profiles using Zero-Knowledge Proofs (ZKPs) and receive automated micropayments.",
        keyFeatures: [
          "ZKP mechanisms allowing users to prove a claim (e.g., age bracket) without revealing raw data",
          "Smart contract escrow to automate secure micropayments from data buyers to users",
          "Integration with decentralized storage (e.g., IPFS) to store encrypted user profiles off-chain",
          "Consent management dashboard to easily grant, track, or instantly revoke data access",
          "Simulated buyer API that requests demographic proofs and triggers smart contract payouts",
          "Cryptographic audit logs that allow users to verifiably track which entities queried their proofs",
          "Bonus: Quantum-ready architecture (e.g., Account Abstraction) to support future signature upgrades",
        ],
        expectedImpact: [
          "Shifts the power dynamic of the data economy back to the consumer",
          "Ensures absolute privacy while enabling a functioning data marketplace",
          "Establishes a trustless, automated bridge between data providers and consumers",
        ],
      },
      {
        id: "BC-02",
        title: "Cryptographic \u201cProof of Training\u201d Registry for AI",
        description:
          "AI systems often operate as complete \"black boxes.\" For end-users and auditors, it is currently nearly impossible to verify exactly what datasets an AI was trained on, or to prove that a model hasn't been secretly altered after its initial deployment.",
        objective:
          "To develop a blockchain-based registry that acts as an immutable, tamper-proof ledger for AI model provenance, ensuring developers can cryptographically prove the exact state and origins of their models.",
        keyFeatures: [
          "On-chain registry for logging cryptographic hashes of training datasets",
          "Smart contracts tracking AI model weights across version updates",
          "Immutable audit trails tracking authorized parameter changes by developers",
          "Hash-based proofs ensuring data integrity without exposing raw proprietary data",
          "Auditor dApp interface to verify states and flag potential model tampering",
          "Strict off-chain execution architecture (AI processing stays off-chain, logs stay on-chain)",
          "Role-based cryptographic access control allowing only verified developers to append new versions",
        ],
        expectedImpact: [
          "Establishes a verifiable chain of trust for black-box AI models",
          "Allows regulators to confirm a model's integrity and data origins securely",
          "Prevents silent, unauthorized manipulation of deployed AI models",
        ],
      },
      {
        id: "BC-03",
        title: "Decentralized Identity (DID) Vault & Verifiable Credentials",
        description:
          "Citizens frequently need to present documents like Aadhaar or PAN for verification. These are often stored in centralized, vulnerable databases or shared via insecure methods, leading to data breaches, identity theft, and document forgery.",
        objective:
          "To develop a secure, user-controlled digital vault leveraging Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) to store, manage, and selectively share verified documents.",
        keyFeatures: [
          "Decentralized Identifier (DID) architecture giving users sovereign identity control",
          "Zero-Knowledge Proofs (ZKPs) allowing selective disclosure (e.g., proving age without showing DOB)",
          "Decentralized storage integration (e.g., IPFS) to store encrypted document hashes",
          "Mock API integration simulating an issuing authority that digitally signs credentials",
          "User-friendly mobile or web wallet featuring instant cryptographic access revocation",
          "Tamper-proof, on-chain audit trails showing exactly when and by whom data was accessed",
          "Secure key recovery mechanism (e.g., social recovery or multi-sig) to prevent total data loss",
        ],
        expectedImpact: [
          "Eliminates reliance on vulnerable, centralized database honeypots",
          "Drastically reduces document forgery and identity theft",
          "Empowers citizens with absolute privacy and control over their personal data",
        ],
      },
      {
        id: "BC-04",
        title: "Programmable Welfare Distribution System",
        description:
          "Government welfare schemes often face massive inefficiencies, delays, and corruption in fund distribution due to manual processing, lack of transparency, and poor beneficiary verification.",
        objective:
          "To develop a blockchain-based programmable system that ensures transparent, automated, and corruption-free welfare distribution.",
        keyFeatures: [
          "Smart contract-based allocation and escrow of government welfare funds",
          "Decentralized beneficiary verification to completely eliminate duplicate or ghost claims",
          "Conditional fund release triggered automatically by verified oracle data or milestones",
          "Transparent, real-time public ledger for tracking fund utilization from source to citizen",
          "Expiration logic that automatically returns unclaimed funds to the treasury",
          "Mobile-optimized dApp interface ensuring easy access for non-technical beneficiaries",
          "Multi-signature wallet requirement for administrators to authorize large batch deployments",
        ],
        expectedImpact: [
          "Ensures efficient, fast, and corruption-free welfare delivery",
          "Builds public trust through absolute financial transparency",
          "Reduces administrative overhead and manual processing errors",
        ],
      },
    ],
  },
  {
    id: "no-code",
    name: "NO CODE / LOW CODE",
    accent: "#ffb300",
    problems: [
      {
        id: "NC-01",
        title: "No-Code Smart Governance Platform Builder",
        description:
          "Government institutions often struggle to digitize services due to limited technical expertise, fragmented systems, and dependency on developers. A no-code platform can empower officials to quickly build, deploy, and manage governance applications without programming knowledge, improving efficiency and service delivery.",
        objective:
          "To develop a user-friendly no-code platform that enables government bodies to create, customize, and manage digital services, workflows, and citizen engagement systems with minimal technical effort.",
        keyFeatures: [
          "Drag-and-drop interface for rapid app development",
          "Custom dashboard creation with real-time analytics",
          "Role-based access control for secure operations",
          "Pre-built templates for common governance services",
          "AI-assisted form builder & automation suggestions",
          "Multi-language support for wider accessibility",
        ],
        expectedImpact: [
          "Faster digital transformation across government departments",
          "Reduced dependency on developers and IT teams",
          "Improved efficiency and transparency in public services",
        ],
      },
      {
        id: "NC-02",
        title: "No-Code AI Study Agent Platform",
        description:
          "Students often struggle with scattered study resources, lack of structured preparation, and difficulty in identifying weak areas. Existing tools are isolated and require manual effort, while building intelligent study assistants demands technical expertise, making personalized learning inefficient.",
        objective:
          "To develop a no-code platform that enables students to create, customize, and deploy AI-powered study agents and automated workflows for structured, adaptive, and personalized exam preparation.",
        keyFeatures: [
          "Custom AI Study Agent Builder",
          "AI-based Content Ingestion & Summarization",
          "Context-Aware Doubt Solver",
          "Adaptive Quiz & Evaluation System",
          "Performance Tracking Dashboard",
          "AI-Driven Performance Analytics",
          "Basic Integration (Google Drive / local uploads)",
        ],
        expectedImpact: [
          "Enables highly personalized and efficient exam preparation",
          "Reduces dependency on multiple disconnected tools",
          "Improves student performance through data-driven insights",
        ],
      },
      {
        id: "NC-03",
        title: "No-Code Agentic Workflow: Customer Support Triage Canvas",
        description:
          "Businesses are consistently overwhelmed by incoming customer queries across multiple channels. Routing these tickets, extracting context, and drafting accurate responses requires massive human effort, but building custom AI automation for this is too technically complex for most operational managers.",
        objective:
          "To develop a visual, drag-and-drop platform allowing non-technical operational teams to build AI agent workflows that autonomously categorize, research, and draft responses to customer support tickets.",
        keyFeatures: [
          "Node-based, drag-and-drop canvas linking incoming mock ticket streams to AI execution agents",
          '"Triage Agent" node to automatically analyze sentiment, categorize urgency, and route the ticket',
          '"Resolution Agent" node that searches mock internal knowledge bases to draft contextual responses',
          'Mandatory "Human-in-the-Loop" review queue for support staff to approve, edit, or reject drafts',
          'Visual conditional logic (e.g., "If sentiment is severe/angry, bypass AI and escalate to human")',
          "Dashboard interface tracking automation success rates and human-override frequencies",
          "Secure API gateway node to safely query mock internal databases without exposing backend infrastructure",
        ],
        expectedImpact: [
          "Democratizes AI-powered automation for non-technical customer service departments",
          "Drastically reduces initial response times and manual ticketing overhead",
          "Maintains strict quality control and brand safety through seamless human oversight",
        ],
      },
      {
        id: "NC-04",
        title: "Low-Code Digital Twin: Warehouse & Inventory Monitor",
        description:
          "Supply chain and logistics operations rely heavily on real-time visibility. However, building interactive, visual monitoring dashboards for physical warehouse spaces usually requires expensive, highly specialized custom software development.",
        objective:
          "To build a low-code platform that allows operations managers to easily draw a 2D digital representation of their warehouse and bind real-time, simulated data streams to physical zones without writing complex code.",
        keyFeatures: [
          "Drag-and-drop 2D spatial mapping canvas for designing accurate floor plans and zones",
          "Visual rule engine for configuring custom thresholds and status alerts",
          "Dynamic UI binding using mock WebSockets for streaming simulated telemetry data",
          "Interactive dashboard components showing historical trends of the simulated inventory",
          "Color-coded heatmaps for instant operational bottleneck identification",
          "Role-based viewing permissions tailored for different levels of facility management",
          "Automated exception logging system that securely records all threshold breaches for post-incident analysis",
        ],
        expectedImpact: [
          "Enhances operational visibility without requiring expensive enterprise software",
          "Allows facility managers to build and modify alert systems with zero coding expertise",
          "Improves response times to localized inventory or equipment bottlenecks",
        ],
      },
    ],
  },
];

export default function ProblemStatements() {
  const [activeTab, setActiveTab] = useState<string>(DOMAINS[0].id);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeDomain = DOMAINS.find((d) => d.id === activeTab) ?? DOMAINS[0];

  useGSAP(
    () => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: i * 0.1,
          }
        );
      });
    },
    { scope: containerRef, dependencies: [activeTab] }
  );

  const toggleCard = (id: string) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundWrapper}>
        <div className={styles.bgParallax} />
        <div className={styles.overlay} />
      </div>

      <BackButton className={styles.backBtn} to="/events/invasion" />

      <header className={styles.hero}>
        <div
          className={styles.heroBadge}
          style={{
            color: activeDomain.accent,
            backgroundColor: `${activeDomain.accent}15`,
            borderColor: `${activeDomain.accent}40`,
          }}
        >
          HACKATHON
        </div>
        <h1 className={styles.heroTitle}>PROBLEM STATEMENTS</h1>
        <p className={styles.heroTagline}>
          Choose your domain. Define your solution.
        </p>
        <div
          className={styles.heroDivider}
          style={{
            background: `linear-gradient(90deg, transparent, ${activeDomain.accent}, transparent)`,
          }}
        />
      </header>

      <div className={styles.tabBar}>
        {DOMAINS.map((domain) => (
          <button
            key={domain.id}
            className={`${styles.tab} ${activeTab === domain.id ? styles.tabActive : ""}`}
            style={
              activeTab === domain.id
                ? { borderColor: domain.accent, color: domain.accent }
                : {}
            }
            onClick={() => {
              setActiveTab(domain.id);
              setExpandedCard(null);
            }}
          >
            {domain.name}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.domainHeader}>
          <span
            className={styles.domainLabel}
            style={{ color: activeDomain.accent }}
          >
            DOMAIN
          </span>
          <h2
            className={styles.domainTitle}
            style={{ color: activeDomain.accent }}
          >
            {activeDomain.name}
          </h2>
          <p className={styles.domainCount}>
            {activeDomain.problems.length} Problem Statements
          </p>
        </div>

        <div className={styles.cardGrid}>
          {activeDomain.problems.map((ps, i) => {
            const isExpanded = expandedCard === ps.id;
            return (
              <div
                key={ps.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`${styles.card} ${isExpanded ? styles.cardExpanded : ""}`}
                style={{ borderColor: `${activeDomain.accent}30` }}
              >
                <div
                  className={styles.cardHeader}
                  onClick={() => toggleCard(ps.id)}
                >
                  <div className={styles.cardMeta}>
                    <span
                      className={styles.cardId}
                      style={{ color: activeDomain.accent }}
                    >
                      {ps.id}
                    </span>
                    <span
                      className={styles.cardNumber}
                      style={{ color: `${activeDomain.accent}60` }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{ps.title}</h3>
                  <div className={styles.cardToggle}>
                    <span
                      className={`${styles.toggleIcon} ${isExpanded ? styles.toggleOpen : ""}`}
                      style={{ color: activeDomain.accent }}
                    >
                      {isExpanded ? "−" : "+"}
                    </span>
                    <span className={styles.toggleLabel}>
                      {isExpanded ? "Collapse" : "View Details"}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.cardBody}>
                    <div className={styles.section}>
                      <h4
                        className={styles.sectionTitle}
                        style={{ color: activeDomain.accent }}
                      >
                        Description
                      </h4>
                      <p className={styles.sectionText}>{ps.description}</p>
                    </div>

                    <div className={styles.section}>
                      <h4
                        className={styles.sectionTitle}
                        style={{ color: activeDomain.accent }}
                      >
                        Objective
                      </h4>
                      <p className={styles.sectionText}>{ps.objective}</p>
                    </div>

                    <div className={styles.section}>
                      <h4
                        className={styles.sectionTitle}
                        style={{ color: activeDomain.accent }}
                      >
                        Key Features
                      </h4>
                      <ul className={styles.featureList}>
                        {ps.keyFeatures.map((f, j) => (
                          <li key={j} className={styles.featureItem}>
                            <span
                              className={styles.bullet}
                              style={{ backgroundColor: activeDomain.accent }}
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.section}>
                      <h4
                        className={styles.sectionTitle}
                        style={{ color: activeDomain.accent }}
                      >
                        Expected Impact
                      </h4>
                      <ul className={styles.impactList}>
                        {ps.expectedImpact.map((imp, j) => (
                          <li key={j} className={styles.impactItem}>
                            <span
                              className={styles.impactBullet}
                              style={{ borderColor: activeDomain.accent }}
                            />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Presented by GDG VIT Mumbai × GDG UMIT</p>
        <p>Vidyalankar Institute of Technology, Mumbai</p>
      </footer>
    </div>
  );
}
