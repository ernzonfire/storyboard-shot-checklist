export type StoryboardShot = {
  id: string;
  frame: string;
  title: string;
  scene: string;
  setup: string;
  script: string;
  preparation: string[];
  capture: string[];
  estimatedDuration: string;
  notes: string;
};

export const storyboardShots: StoryboardShot[] = [
  {
    id: "frame-01",
    frame: "01",
    title: "Opening",
    scene: "Opening",
    setup: "Wide shot - call center floor, advocates at work",
    script:
      "VO: Every great member experience starts with advocates who have the right information at the right moment.",
    preparation: [
      "Call center floor ready",
      "Advocates seated and actively working",
      "Warm, understated background feel",
    ],
    capture: [
      "Wide establishing shot",
      "Camera slowly pushes in",
      "Advocates at desks",
    ],
    estimatedDuration: "~15 sec",
    notes: "Establish the floor energy and visual tone before moving into interviews.",
  },
  {
    id: "frame-02",
    frame: "02",
    title: "Site Director",
    scene: "Site Director Interview",
    setup: "Site Director on-camera, interview style, conversational",
    script:
      "Site Director: Agent Assist helps our teams move with more confidence, giving advocates faster access to the guidance they need while they support members.",
    preparation: [
      "Site Director confirmed",
      "Interview area prepared",
      "Lower third name/title ready",
    ],
    capture: [
      "Interview setup with shallow depth of field",
      "Call center floor visible in background",
      "Clean audio",
    ],
    estimatedDuration: "~30 sec",
    notes: "Keep the setting authentic while controlling background activity.",
  },
  {
    id: "frame-03",
    frame: "03",
    title: "B-Roll",
    scene: "Screen capture / over-the-shoulder",
    setup: "Over-the-shoulder shot of Agent Assist in CRM",
    script:
      "VO: Inside the CRM, Agent Assist surfaces answers, prompts, and summaries in the flow of the conversation.",
    preparation: [
      "Confirm if real UI is approved or use recreated mockup",
      "CRM screen ready",
      "Advocate workstation ready",
    ],
    capture: [
      "Close over-the-shoulder screen shot",
      "Slight rack focus to advocate face",
      "Agent Assist UI",
      "Ask Me Anything feature",
      "Post-call summary",
    ],
    estimatedDuration: "~25 sec",
    notes: "Confirm UI clearance before rolling on any screen details.",
  },
  {
    id: "frame-04",
    frame: "04",
    title: "Training Director",
    scene: "Future Features",
    setup: "Training Director interview about 2026 features",
    script:
      "Training Director: As we look ahead, features like guided workflows, task automation, and real-time coaching will help advocates keep improving with every interaction.",
    preparation: [
      "Training Director confirmed",
      "Feature cards/motion graphics prepared",
      "Lower third name/title ready",
    ],
    capture: [
      "Interview framing",
      "Animated feature cards",
      "Guided Workflows",
      "Task Automation",
      "Real-Time Coaching",
    ],
    estimatedDuration: "~25 sec",
    notes: "Leave clean space in frame if motion graphics will be added in post.",
  },
  {
    id: "frame-05",
    frame: "05",
    title: "Advocate 1",
    scene: "Advocate Testimonial 1",
    setup: "Confidence and accuracy testimonial",
    script:
      "Advocate 1: It helps me feel more confident because I can find the right answer faster and stay focused on the member.",
    preparation: ["Advocate 1 confirmed", "Workstation ready"],
    capture: [
      "Interview setup near workstation",
      "Screen showing real-time response populating",
    ],
    estimatedDuration: "~18 sec",
    notes: "Prioritize confidence, clarity, and natural delivery.",
  },
  {
    id: "frame-06",
    frame: "06",
    title: "Advocate 2",
    scene: "Advocate Testimonial 2",
    setup: "Ask Me Anything and complex calls",
    script:
      "Advocate 2: When a call gets complex, Ask Me Anything gives me a place to check guidance quickly without losing the conversation.",
    preparation: [
      "Advocate 2 confirmed",
      "Ask Me Anything mockup or live demo ready",
    ],
    capture: [
      "Interview near workstation",
      "Hands typing in Ask Me Anything field",
      "Response card appearing on screen",
    ],
    estimatedDuration: "~18 sec",
    notes: "Capture enough hand and screen action for a clean edit sequence.",
  },
  {
    id: "frame-07",
    frame: "07",
    title: "Advocate 3",
    scene: "Advocate Testimonial 3",
    setup: "Post-call summary and efficiency",
    script:
      "Advocate 3: The post-call summary saves time and helps me wrap up accurately so I can be ready for the next member.",
    preparation: ["Advocate 3 confirmed", "Post-call summary screen ready"],
    capture: [
      "Warm interview setup",
      "Advocate reviewing post-call summary",
      "Advocate smiling / resetting for next call",
    ],
    estimatedDuration: "~18 sec",
    notes: "Use this frame to show relief, speed, and readiness for the next member.",
  },
  {
    id: "frame-08",
    frame: "08",
    title: "Advocate 4",
    scene: "Advocate Testimonial 4",
    setup: "Interaction 360 and member connection",
    script:
      "Advocate 4: Interaction 360 gives me more context, so I can make the experience feel personal and connected.",
    preparation: ["Advocate 4 confirmed", "Interaction 360 panel ready"],
    capture: [
      "Interview style shot",
      "Interaction 360 panel on screen",
      "Close-up of advocate's warm expression",
    ],
    estimatedDuration: "~20 sec",
    notes: "Let the human connection read clearly on camera.",
  },
  {
    id: "frame-09",
    frame: "09",
    title: "Senior Ops Manager",
    scene: "Senior Ops Manager Testimonial",
    setup: "Advocate development and coaching",
    script:
      "Senior Ops Manager: Agent Assist gives us better visibility into where advocates need support and where coaching can make the biggest impact.",
    preparation: [
      "Senior Ops Manager confirmed",
      "Coaching room or conference room ready",
      "Lower third name/title ready",
    ],
    capture: [
      "Interview setup in coaching room",
      "Optional coach and advocate reviewing post-call summary side by side",
    ],
    estimatedDuration: "~25 sec",
    notes: "Good candidate for a calmer, focused interview environment.",
  },
  {
    id: "frame-10",
    frame: "10",
    title: "Ops VP",
    scene: "Closing",
    setup: "Ops VP closing statement on call center floor",
    script:
      "Ops VP: This is about empowering our advocates, strengthening our operations, and creating better experiences for every member we serve.",
    preparation: [
      "Ops VP confirmed",
      "Floor background active but controlled",
      "Lower third name/title ready",
    ],
    capture: [
      "Ops VP standing on call center floor",
      "Pull-back reveal shot",
      "Advocates working in background",
      "Warm natural lighting",
    ],
    estimatedDuration: "~20 sec",
    notes: "Close with scale, momentum, and a polished leadership beat.",
  },
  {
    id: "frame-11",
    frame: "11",
    title: "End Card",
    scene: "End Card",
    setup: "Branded end card with tagline",
    script:
      "SUPER / VO: Agent Assist. Helping advocates deliver smarter, faster, more connected member experiences.",
    preparation: [
      "ResultsCX logo",
      "Humana logo",
      "Agent Assist branding lockup",
      "Final tagline ready",
    ],
    capture: [
      "Full-screen graphic",
      "Dark teal background",
      "Clean typography",
      "Music fade out",
    ],
    estimatedDuration: "~8 sec",
    notes: "Confirm final tagline and brand lockups before export.",
  },
];
