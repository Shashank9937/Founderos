const { useEffect, useMemo, useRef, useState } = React;

const STORAGE_KEY = 'founder_os_v1';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'logbook', label: 'Logbook', icon: '📝' },
  { id: 'documents', label: 'Doc Sections', icon: '🗃' },
  { id: 'manual', label: 'Founder Manual', icon: '📘' },
  { id: 'execution', label: 'Execution Tracker', icon: '🧭' },
  { id: 'learning', label: 'Learning Tracker', icon: '📚' },
  { id: 'decisions', label: 'Decision Log', icon: '🧠' },
  { id: 'knowledge', label: 'Knowledge Base', icon: '🗂' },
  { id: 'metrics', label: 'Metrics Dashboard', icon: '📈' },
  { id: 'ai', label: 'AI Workflows', icon: '🤖' },
  { id: 'rhythm', label: 'Weekly Rhythm', icon: '🗓' }
];

const RHYTHM_DAYS = [
  { key: 'monday', day: 'Monday', focus: 'Planning', prompt: 'Set top goals, define critical outcomes, and block deep work.' },
  { key: 'tuesday', day: 'Tuesday', focus: 'Sales', prompt: 'Log calls, pipeline movement, objections, and next steps.' },
  { key: 'wednesday', day: 'Wednesday', focus: 'Product', prompt: 'Track build progress, bugs closed, and user feedback integrated.' },
  { key: 'thursday', day: 'Thursday', focus: 'Growth', prompt: 'Document experiments, hypotheses, and channel learnings.' },
  { key: 'friday', day: 'Friday', focus: 'Review', prompt: 'Reflect on wins, misses, and next week priorities.' }
];

const DECISION_CATEGORIES = ['Product', 'Growth', 'Sales', 'Hiring', 'Fundraising', 'Finance', 'Operations'];

const PLAYBOOK_TYPES = ['Sales', 'Growth', 'Product', 'Fundraising', 'Hiring'];

const BRUTAL_TRUTHS = [
  'Busy is not productive. Real work means decisions, hypothesis tests, and customer conversations.',
  'You do not have an idea problem. You have a validation problem.',
  'Family business is an asset and an anchor. Use it for leverage, not excuses.',
  'You likely have enough time. The bottleneck is focus quality.',
  'Climate / biomass / carbon are marathon markets. Learn deeply before scaling.',
  'Overthinking is procrastination in a suit. Ship, learn, iterate.',
  'At 26, learning velocity is your biggest asset. Optimize for rapid feedback loops.'
];

const DAILY_EXECUTION_SCHEDULE = [
  { id: '0500', time: '5:00-5:20', block: 'Ignition', action: 'Journal yesterday win, today #1 priority, one risk to manage.', output: 'Day mission clarity' },
  { id: '0520', time: '5:20-6:00', block: 'Deep Read / Learn', action: 'Focused reading on biomass, carbon, logistics, or regulation. No social/news.', output: '1 insight logged' },
  { id: '0600', time: '6:00-7:00', block: 'Physical', action: 'Gym/run/walk. No exceptions.', output: 'Physical output complete' },
  { id: '0700', time: '7:00-8:00', block: 'Family Business Review', action: 'Handle only critical decisions. Delegate recurring operations.', output: 'Ops handed off by 8 AM' },
  { id: '0800', time: '8:00-10:00', block: 'Deep Work Block 1', action: 'Single highest-impact founder task. Zero interruptions.', output: '1 concrete output' },
  { id: '1000', time: '10:00-11:00', block: 'Family Business Execution', action: 'Batch calls, meetings, approvals.', output: 'Batched execution complete' },
  { id: '1100', time: '11:00-1:00', block: 'Deep Work Block 2', action: 'Validation calls, research, framework building, modeling.', output: '1 concrete output' },
  { id: '1300', time: '1:00-2:00', block: 'Lunch + Recovery', action: 'Eat, walk, no screens for reset.', output: 'Cognitive reset complete' },
  { id: '1400', time: '2:00-4:00', block: 'Deep Work Block 3', action: 'Outreach, expert calls, writing, mapping.', output: '1 concrete output' },
  { id: '1600', time: '4:00-5:00', block: 'Family Business + Admin', action: 'Close admin in 1 hour max.', output: 'Admin closed' },
  { id: '1700', time: '5:00-6:30', block: 'Field Work / Learning', action: 'Visit factories, suppliers, farmers, logistics hubs, or competitors.', output: '1 field observation logged' },
  { id: '1830', time: '6:30-7:30', block: 'Secondary Research', action: 'Research reports, expert sources, structured notes.', output: '1 data point logged' },
  { id: '2030', time: '8:30-9:30', block: 'Daily Review + Planning', action: 'Update dashboard, wins/learnings, next top 3 outputs.', output: 'System updated' },
  { id: '2130', time: '9:30', block: 'Shutdown', action: 'Devices down, sleep protocol.', output: 'Shutdown complete' }
];

const WEEKLY_OPERATING_MODEL = [
  { id: 'monday', day: 'Monday', theme: 'Strategy Day', focus: 'Set weekly goals, top 3 hypotheses, key contacts.', output: 'Weekly plan locked by 9 AM' },
  { id: 'tuesday', day: 'Tuesday', theme: 'Market Intel', focus: 'Research one segment, map competitors, identify customers.', output: 'Market map updated' },
  { id: 'wednesday', day: 'Wednesday', theme: 'Customer Day', focus: 'Run minimum 3 customer or expert conversations.', output: '3 call notes + insights' },
  { id: 'thursday', day: 'Thursday', theme: 'Validation Day', focus: 'Test one hypothesis and build one-page case.', output: 'Hypothesis confirmed or killed' },
  { id: 'friday', day: 'Friday', theme: 'Build Day', focus: 'Create one tangible artifact.', output: '1 artifact created' },
  { id: 'saturday', day: 'Saturday', theme: 'Reflection + Learning', focus: 'Review week and identify bottlenecks.', output: 'Weekly scorecard complete' },
  { id: 'sunday', day: 'Sunday', theme: 'Reset', focus: 'Recovery, physical, family, unrelated reading.', output: 'Cognitive reset complete' }
];

const VALIDATION_FUNNEL = [
  { id: 'pain', stage: 'Pain Mining', action: 'Interview operators and isolate expensive recurring pain.', timeBox: 'Week 1-2', pass: '3+ independent pain confirmations', kill: 'Pain is minor or already solved' },
  { id: 'market', stage: 'Market Sizing', action: 'Bottom-up TAM and willingness-to-pay economics.', timeBox: 'Week 3', pass: 'TAM > ₹500Cr and ACV > ₹2L', kill: 'Fragmented or too-small market' },
  { id: 'solution', stage: 'Solution Hypothesis', action: 'Test a simple one-page solution concept verbally.', timeBox: 'Week 4', pass: 'Strong pull response from target users', kill: 'Lukewarm “interesting” feedback' },
  { id: 'wtp', stage: 'Willingness to Pay', action: 'Ask for LOI, pilot commitment, or pre-payment.', timeBox: 'Week 5-6', pass: '2+ commitments', kill: 'Positive feedback but no payment' },
  { id: 'pilot', stage: 'Pilot Execution', action: 'Run manual founder-led pilot for initial customers.', timeBox: 'Week 7-8', pass: 'Renewal or referral + NPS > 8', kill: 'Pilot churn and no referral' }
];

const DISTRACTION_AUDIT = [
  { id: 'social', type: 'Social media scroll', protocol: 'Phone out of room during deep work. Social window only in evening.' },
  { id: 'reactive-msg', type: 'Reactive messages', protocol: 'Check windows only: morning, midday, evening.' },
  { id: 'family-fire', type: 'Family business fire drills', protocol: 'Escalation filter. Delegate first-response owner.' },
  { id: 'research-rabbit', type: 'Research rabbit holes', protocol: '45-min research then forced written output.' },
  { id: 'pseudo-work', type: 'Pseudo-productivity', protocol: 'If no customer/market signal, deprioritize for today.' },
  { id: 'meeting-creep', type: 'Meeting creep', protocol: 'No agenda = no meeting. Prefer async.' },
  { id: 'idea-loop', type: 'Idea journaling without action', protocol: '15-min max then one test action within 24h.' },
  { id: 'news', type: 'News consumption', protocol: 'Scheduled slot only. Not during execution windows.' }
];

const DAILY_METRIC_TEMPLATE = [
  { id: 'd_convos', metric: 'Customer/Expert conversations', target: '1/day minimum' },
  { id: 'd_insight', metric: 'New market insight logged', target: '1/day' },
  { id: 'd_hypothesis', metric: 'Hypothesis test actions', target: '1/day' },
  { id: 'd_deepwork', metric: 'Deep work hours (uninterrupted)', target: '4 hrs minimum' },
  { id: 'd_social', metric: 'Social media consumed (minutes)', target: '0 during work' },
  { id: 'd_family', metric: 'Family business handled by 8 AM', target: 'Yes/No' },
  { id: 'd_outputs', metric: 'Top 3 outputs completed', target: 'Yes/No/Partial' },
  { id: 'd_physical', metric: 'Physical activity done', target: 'Yes/No' }
];

const WEEKLY_METRIC_TEMPLATE = [
  { id: 'w_convos', metric: 'Customer conversations this week', target: '5 minimum' },
  { id: 'w_hyp', metric: 'Hypotheses tested', target: '2 minimum' },
  { id: 'w_kill', metric: 'Hypotheses killed', target: '1+ per 2 weeks' },
  { id: 'w_active', metric: 'Ideas in active validation', target: '1-2' },
  { id: 'w_expert', metric: 'Expert connections made', target: '3/week' },
  { id: 'w_cases', metric: '1-page business cases written', target: '1/week' },
  { id: 'w_field', metric: 'Field visits / ground work', target: '2/week' },
  { id: 'w_hours', metric: 'Productive deep work hours total', target: '25+ hrs' }
];

const MONTHLY_SCORECARD_TEMPLATE = [
  { id: 'm_interviews', metric: 'Total customer interviews completed', target: '40+' },
  { id: 'm_markets_eval', metric: 'Markets seriously evaluated', target: '3' },
  { id: 'm_markets_kill', metric: 'Markets killed with evidence', target: '2' },
  { id: 'm_active_validation', metric: 'Active validation in progress', target: '1 strong idea' },
  { id: 'm_pilot_customers', metric: 'Potential pilot customers identified', target: '5+' },
  { id: 'm_loi', metric: 'LOI or pilot commitments', target: '2+' },
  { id: 'm_burn', metric: 'Personal monthly burn tracked', target: 'Yes' },
  { id: 'm_delegate', metric: 'Family business delegation built', target: 'Yes' }
];

const DECISION_MATRIX_TEMPLATE = [
  { id: 'q1', quadrant: 'Q1', type: 'High Impact + Time Sensitive', protocol: 'Execute now before anything else.' },
  { id: 'q2', quadrant: 'Q2', type: 'High Impact + Not Time Sensitive', protocol: 'Schedule protected deep work block in next 3 days.' },
  { id: 'q3', quadrant: 'Q3', type: 'Low Impact + Time Sensitive', protocol: 'Delegate or batch.' },
  { id: 'q4', quadrant: 'Q4', type: 'Low Impact + Not Time Sensitive', protocol: 'Eliminate.' }
];

const SECTOR_PRIORITIES = [
  { id: 'biomass', sector: 'Biomass Energy', go: 'Pilot under ₹5L with operational pain.' },
  { id: 'carbon', sector: 'Carbon Credits', go: '50+ farmer aggregation with MRV partner path.' },
  { id: 'logistics', sector: 'B2B Logistics', go: 'Deep access to one lane or node.' },
  { id: 'climate-b2b', sector: 'Climate Tech B2B', go: 'Anchor customer or anchor project exists.' },
  { id: 'agri', sector: 'Agri Input/Output', go: 'Use family-business adjacency as distribution edge.' }
];

const THIRTY_DAY_PLAN = [
  { id: 'day1', day: 1, week: 'Week 1', task: 'List 10 problems across biomass/carbon/agri.', output: '10 problem statements' },
  { id: 'day2', day: 2, week: 'Week 1', task: 'Map ecosystem for top 2 sectors.', output: '2 ecosystem maps' },
  { id: 'day3', day: 3, week: 'Week 1', task: 'Build 20-person interview list.', output: 'Outreach list complete' },
  { id: 'day4', day: 4, week: 'Week 1', task: 'Send 20 cold outreach messages.', output: '20 outbound messages sent' },
  { id: 'day5', day: 5, week: 'Week 1', task: 'Teardown 5 competitors.', output: 'Competitor teardown' },
  { id: 'day6', day: 6, week: 'Week 1', task: 'Do first field visit.', output: '500+ word field notes' },
  { id: 'day7', day: 7, week: 'Week 1', task: 'Rank top 3 hypotheses.', output: 'Hypothesis ranking' },
  { id: 'day8', day: 8, week: 'Week 2', task: 'Run 2 customer interviews.', output: '2 interview notes' },
  { id: 'day9', day: 9, week: 'Week 2', task: 'Run 2 more interviews and update confidence.', output: 'Hypothesis confidence update' },
  { id: 'day10', day: 10, week: 'Week 2', task: 'Synthesize first interview batch.', output: '1-page synthesis' },
  { id: 'day11', day: 11, week: 'Week 2', task: 'Run 2 interviews focused on willingness to pay.', output: 'Pricing signal notes' },
  { id: 'day12', day: 12, week: 'Week 2', task: 'Map buyer journey.', output: 'Buyer journey map' },
  { id: 'day13', day: 13, week: 'Week 2', task: 'Run 2 interviews and capture trust signals.', output: 'Trust signal list' },
  { id: 'day14', day: 14, week: 'Week 2', task: 'Close week with 10 interviews total.', output: '10 interviews complete' },
  { id: 'day15', day: 15, week: 'Week 3', task: 'Write 1-page problem-solution brief.', output: 'Brief complete' },
  { id: 'day16', day: 16, week: 'Week 3', task: 'Share brief to 5 people and gather feedback.', output: '5 feedback entries' },
  { id: 'day17', day: 17, week: 'Week 3', task: 'Revise solution and define simplest pilot.', output: 'Pilot concept' },
  { id: 'day18', day: 18, week: 'Week 3', task: 'Build 1-page financial model.', output: 'Financial model' },
  { id: 'day19', day: 19, week: 'Week 3', task: 'Identify 3 pilot customers + proposal.', output: 'Pilot proposal' },
  { id: 'day20', day: 20, week: 'Week 3', task: 'Present proposal to 2 customers.', output: '2 pilot meetings' },
  { id: 'day21', day: 21, week: 'Week 3', task: 'Review signal and learning.', output: 'Signal summary' },
  { id: 'day22', day: 22, week: 'Week 4', task: 'Score top idea against validation funnel.', output: 'Validation scorecard' },
  { id: 'day23', day: 23, week: 'Week 4', task: 'Get brutal advisor feedback.', output: 'Risks updated' },
  { id: 'day24', day: 24, week: 'Week 4', task: 'Make GO/NO-GO decision.', output: 'Decision locked' },
  { id: 'day25', day: 25, week: 'Week 4', task: 'Write internal investor memo.', output: '5-page memo' },
  { id: 'day26', day: 26, week: 'Week 4', task: 'Set 90-day milestones.', output: 'Milestone map' },
  { id: 'day27', day: 27, week: 'Week 4', task: 'Initiate 3 high-value connections.', output: '3 intros initiated' },
  { id: 'day28', day: 28, week: 'Week 4', task: 'Document unfair advantages.', output: 'Moat analysis' },
  { id: 'day29', day: 29, week: 'Week 4', task: 'Run 30-day retrospective.', output: '2-page review' },
  { id: 'day30', day: 30, week: 'Week 4', task: 'Lock Month 2 goals.', output: 'Month 2 plan locked' }
];

const WEEKLY_FORCING_QUESTIONS = [
  { id: 'fq1', question: 'What specific hypothesis did I test this week?' },
  { id: 'fq2', question: 'What did customers tell me that surprised me?' },
  { id: 'fq3', question: 'What did I kill this week?' },
  { id: 'fq4', question: 'What is my single most important action for next week?' },
  { id: 'fq5', question: 'What am I procrastinating on and why?' }
];

const MONTHLY_REVIEW_CHECKS = [
  { id: 'mr1', text: 'Review metrics dashboard honestly.' },
  { id: 'mr2', text: 'Kill dead hypotheses and promote strong ones.' },
  { id: 'mr3', text: 'Refine daily schedule based on friction points.' },
  { id: 'mr4', text: 'Increase family business delegation leverage.' },
  { id: 'mr5', text: 'Identify highest-leverage activity for next month.' }
];

const NON_NEGOTIABLES_TEMPLATE = [
  {
    id: 'nn_hydration',
    title: 'Hydration before 06:00',
    description: 'Drink first 500ml water before screens.'
  },
  {
    id: 'nn_exercise',
    title: '30-min physical block',
    description: 'Run, weights, or mobility completed.'
  },
  {
    id: 'nn_dw1',
    title: 'Deep Work Block 1 output',
    description: 'One concrete startup deliverable by DW1 lock.'
  },
  {
    id: 'nn_dw2',
    title: 'Deep Work Block 2 output',
    description: 'One concrete validation/output deliverable by DW2 lock.'
  },
  {
    id: 'nn_outreach',
    title: '10 outreach messages sent',
    description: 'Cold/warm outreach completed.'
  },
  {
    id: 'nn_followups',
    title: '5 follow-ups completed',
    description: 'Active conversation follow-ups sent.'
  },
  {
    id: 'nn_conversations',
    title: '2 operator/customer conversations',
    description: 'Documented with notes and signals.'
  },
  {
    id: 'nn_skill_block',
    title: '30-min skill/domain block',
    description: 'Learning block completed with one applied insight.'
  },
  {
    id: 'nn_dashboard',
    title: '17:00 dashboard review',
    description: 'KPIs logged and tomorrow 3 outputs set.'
  },
  {
    id: 'nn_shutdown',
    title: 'Night shutdown protocol',
    description: 'Shutdown checklist done and sleep window protected.'
  }
];

const DOCUMENT_LIBRARY_TEMPLATE = [
  {
    id: 'doc_founder_operating_system',
    title: 'Founder Operating System',
    sourceFile: 'Founder_Operating_System.docx',
    sections: [
      {
        id: 'fos_01',
        title: '01 Daily Execution Blueprint',
        content: `Every hour is pre-decided and output-first.

Core schedule blocks:
- 05:00 wake and reset, no phone.
- 06:00 Deep Work Block 1 (highest-priority startup output).
- 08:15 to 14:00 family business operations with delegation.
- 12:30 Deep Work Block 2 (validation calls, scoring, follow-up).
- 17:00 review KPIs and lock tomorrow's 3 outputs.
- 21:00 shutdown protocol and sleep protection.

Rules:
- One task per deep work block.
- If interrupted, log and eliminate the source within 48 hours.
- Instrumental music only; no context switching.
- Night shutdown always includes KPI logging and next-day planning.`
      },
      {
        id: 'fos_02',
        title: '02 30-Day Idea to Validation War Plan',
        content: `Goal: find one painful problem buyers will pay for before building.

Week 1: problem extraction
- Document 50 problems and shortlist top 5.

Week 2: demand stress test
- Write problem briefs, publish a landing page, send outreach, run calls.

Week 3: first revenue signal
- Offer manual pilot, deliver, and ask for payment or LOI.

Week 4: kill or accelerate
- Seek disconfirming evidence, model economics, and make binary decision.

Continue threshold:
- 25+ conversations by Day 30.
- 5+ explicit willingness-to-pay confirmations.
- 1+ LOI or payment attempt by Day 28.`
      },
      {
        id: 'fos_03',
        title: '03 Idea Generation Framework',
        content: `Mine problems systematically from:
- Operator interviews.
- Government and compliance reports.
- Job postings.
- Failed startups.
- LinkedIn operator complaints.
- Family business workflows.
- Trade conference questions.

Score each idea on:
- Market size.
- Severity and frequency.
- Willingness to pay.
- Defensibility.
- Speed to revenue.
- Founder edge.

Scoring rule:
- <65 kill.
- 65 to 79 validate further.
- 80+ pursue aggressively.`
      },
      {
        id: 'fos_04',
        title: '04 Distraction Elimination Protocol',
        content: `Cognitive drift control:
- Write 3 daily outputs on physical sticky note each morning.
- Read sticky note before touching keyboard.
- Start each deep work block with a written deliverable promise.

Task-switching prevention:
- One browser window and one tab during deep work.
- Capture new tasks on paper, do not execute mid-block.
- Re-enter primary task within 30 seconds.

2-minute decision rule:
- If reversible and under threshold risk, decide immediately.
- If irreversible, cap deliberation at 30 minutes then decide.`
      },
      {
        id: 'fos_05',
        title: '05 Passive Time Optimization',
        content: `Use passive time as leverage, not extra stress.

Protocols:
- Driving: domain podcasts/audiobooks + 90-second applied note.
- Walking: no audio input, only synthesis and voice capture.
- Waiting: collect observed problems in physical note cards.
- Long travel: one long-form report/book, not random articles.

Rule:
- Passive time is input/synthesis only.
- Do not make major decisions during passive blocks.`
      },
      {
        id: 'fos_06',
        title: '06 Weekly Metrics Dashboard',
        content: `Daily/weekly KPI tracker includes:
- Problems documented.
- Industry conversations.
- Ideas scored.
- Outreach and follow-ups.
- Revenue asks.
- Skill blocks completed.
- Fake productivity incidents.

Sunday review:
- Hit-rate vs target.
- Root-cause for weakest KPI.
- Largest concrete output.
- Next week's single highest-leverage action.`
      },
      {
        id: 'fos_07',
        title: '07 Decision Framework',
        content: `Kill an idea if:
- Problem is nice-to-have after 20+ conversations.
- No LOI or payment by Day 28.
- Buyer has inaccessible approval chain.
- Time-to-revenue exceeds practical runway.

Double down if:
- 2+ paid/LOI signals.
- Organic referrals appear.
- Weekly recurring pain is reduced for pilot users.
- Path to 50 clients in 90 days is visible.

Pivot rule:
- Pivot on evidence only, never intuition.
- Complete 10 fresh conversations before formal pivot.`
      },
      {
        id: 'fos_08',
        title: '08 Brutal Truth',
        content: `Primary failure modes:
- Context fragmentation across family business and startup.
- Validation theater without money signals.
- Premature complexity before first paying client.
- Multi-sector drift instead of one 30-day focus.
- Consumption addiction over execution.

Success is driven by:
- Iteration speed.
- Conversation volume.
- System adherence under pressure.
- Fast kill decisions.
- Access to the right operators and decision rooms.`
      }
    ]
  },
  {
    id: 'doc_zero_to_founder_war_mode',
    title: 'Zero-To-Founder War Mode',
    sourceFile: 'Zero_To_Founder_War_Mode.docx',
    sections: [
      {
        id: 'ztf_01',
        title: '01 Founder Core Mastery Roadmap',
        content: `Learning is ranked, sequenced, and applied immediately.

Priority capability stack:
- CEO decision quality (first principles, asymmetry, second-order effects).
- Supply chain systems and margin nodes.
- Unit economics and cash conversion discipline.
- B2B sales and negotiation.
- Buyer psychology and status-quo break mechanisms.
- Operations SOP design and capital allocation.
- Moat development from data, workflow, and regulation.

Application rule:
- Same-day execution for every learned concept.`
      },
      {
        id: 'ztf_02',
        title: '02 30-Day Company Launch War Plan',
        content: `Definition of launch:
- Validated painful problem.
- Revenue attempt (payment/LOI/pilot commitment).
- Legal entity filing.
- 90-day forward plan.

Phase 1 (Days 1 to 10):
- Sector selection, conversations, scored problem shortlist.

Phase 2 (Days 11 to 20):
- Pilot offer, LOI asks, manual delivery, revenue asks.

Phase 3 (Days 21 to 30):
- SOP, repeatability, unit economics, registration, second client attempt.`
      },
      {
        id: 'ztf_03',
        title: '03 Daily Time Structure',
        content: `Non-negotiable schedule for split-focus founders:
- 05:00 wake protocol.
- 06:00 deep work block 1.
- 08:15 to 14:00 family business block.
- 12:30 deep work block 2.
- 15:00 outreach block.
- 17:00 dashboard review.
- 21:00 shutdown ritual.

Family business leverage:
- Use network access for first customer conversations.
- Use cash-flow buffer to avoid premature fundraising.
- Convert operational proximity into proprietary insights.`
      },
      {
        id: 'ztf_04',
        title: '04 AI Agent Leverage System',
        content: `AI replaces first hires at zero capital.

Core agents:
- Market research analyst.
- Lead research and outreach personalization.
- Sales messaging and follow-up sequence engine.
- Financial modeling assistant.
- SOP/documentation generator.
- Competitor intelligence monitor.

AI usage rule:
- Every session must produce an output actionable today.
- If output is only "interesting," stop and redefine objective.`
      },
      {
        id: 'ztf_05',
        title: '05 Idea Generation Framework From Zero',
        content: `Problem mining sources:
- Family business manual workflows.
- Operator complaints.
- Sector/government reports.
- Job posting patterns.
- Failure postmortems.
- Commodity volatility.
- Regulatory gaps.

Scoring:
- Urgency, frequency, budget access, market size, founder access, speed to revenue, defensibility, scalability.
- Minimum score to proceed: 70.

Model preference:
- Start with high-margin, low-volume B2B service-enabled models.`
      },
      {
        id: 'ztf_06',
        title: '06 Validation System Full Toolkit',
        content: `Validation toolkit includes:
- Cold outreach scripts (problem-led and referral-led).
- 25-minute discovery call structure.
- Objection handling playbook.
- Pilot offer template with urgency and ROI framing.
- Three-round pricing experiment model.

Hard kill triggers:
- Weak unprompted pain confirmation.
- Zero paid intent after multiple offers.
- No buyer budget authority access.
- Delivery model impossible to scale from manual pilot.`
      },
      {
        id: 'ztf_07',
        title: '07 Execution Metrics Dashboard',
        content: `Track daily and weekly:
- Problems documented.
- Operator conversations.
- Ideas scored.
- Cold outreach and follow-up counts.
- Revenue asks and pilot offers.
- AI workflows executed.
- Skill blocks completed.
- Fake productivity incidents.
- Validation signals.

Run Sunday review and milestone audit:
- Compare to 30-day target timeline.
- Diagnose structural failures before next week starts.`
      },
      {
        id: 'ztf_08',
        title: '08 Brutal Founder Reality',
        content: `Likely blind spots:
- Busyness without founder outputs.
- Sector paralysis from too many options.
- Family business consuming startup deep work.
- Over-planning in place of external action.
- Conservatism as disguised avoidance.

Operator behavior:
- One active idea.
- Frequent revenue asks.
- Fast kill decisions.
- Measured by shipped outputs and customer evidence.

Predictive variables:
- Speed to first 25 conversations.
- Ruthless kill discipline.
- Consistent revenue ask repetition.
- Deep-work protection.
- Single-sector depth over shallow breadth.`
      }
    ]
  }
];

const ROADMAP_TEMPLATE = [
  {
    month: 1,
    title: 'Idea Generation & Selection',
    exitCriteria: ['Defined painful problem', 'Selected one narrow wedge', 'Validated urgency with target users'],
    activities: ['Interview 20 prospects', 'Map competitive landscape', 'Write one-page thesis']
  },
  {
    month: 2,
    title: 'Deep Validation',
    exitCriteria: ['10+ users commit to pilot', 'Clear willingness-to-pay signal', 'ICP and job-to-be-done documented'],
    activities: ['Run structured interview script', 'Test pricing hypotheses', 'Collect objections and patterns']
  },
  {
    month: 3,
    title: 'MVP Build',
    exitCriteria: ['MVP shipped', 'Activation path is < 10 minutes', 'Core workflow works end-to-end'],
    activities: ['Define MVP scope', 'Ship weekly iterations', 'Instrument key events']
  },
  {
    month: 4,
    title: 'Product-Market Fit',
    exitCriteria: ['Retention baseline established', 'Users repeat core action weekly', 'Top value proposition is clear'],
    activities: ['Fix onboarding friction', 'Improve activation conversion', 'Collect PMF survey feedback']
  },
  {
    month: 5,
    title: 'Growth Experimentation',
    exitCriteria: ['Experiment cadence is weekly', 'One repeatable channel found', 'CAC assumptions validated'],
    activities: ['Design growth backlog', 'Run A/B messaging tests', 'Track channel ROI']
  },
  {
    month: 6,
    title: 'Scale Operations',
    exitCriteria: ['Operating cadence stable', 'SOPs documented', 'Burn monitored against milestones'],
    activities: ['Create SOPs for sales and support', 'Set KPI review rituals', 'Tighten unit economics']
  },
  {
    month: 7,
    title: 'Fundraising Prep',
    exitCriteria: ['Narrative and deck ready', 'Data room baseline complete', 'Target investor list built'],
    activities: ['Refine story and traction slides', 'Practice partner meetings', 'Prepare diligence docs']
  },
  {
    month: 8,
    title: 'Traction Obsession',
    exitCriteria: ['Growth metrics improve weekly', 'Retention and revenue trends stable', 'Customer references secured'],
    activities: ['Double down on top channel', 'Strengthen customer success loops', 'Collect proof points']
  },
  {
    month: 9,
    title: 'Fundraising Sprint',
    exitCriteria: ['Investor meetings completed', 'Term-sheet conversations active', 'Clear raise timeline in motion'],
    activities: ['Run tight outreach schedule', 'Track investor pipeline', 'Handle partner follow-ups fast']
  },
  {
    month: 10,
    title: 'Scale & Close',
    exitCriteria: ['Post-raise hiring plan ready', 'Runway extension modeled', 'Core GTM team staffed'],
    activities: ['Prioritize senior hires', 'Build next 2-quarter plan', 'Align KPIs by function']
  },
  {
    month: 11,
    title: 'Scale & Close',
    exitCriteria: ['Diligence complete', 'Governance and reporting framework set', 'Expansion roadmap clear'],
    activities: ['Finalize legal and compliance items', 'Establish board reporting', 'Expand go-to-market motions']
  },
  {
    month: 12,
    title: 'Scale & Close',
    exitCriteria: ['Series A process closed', 'Next-year operating plan approved', 'Execution system institutionalized'],
    activities: ['Launch annual operating plan', 'Set quarterly targets', 'Transition to scale cadence']
  }
];

const MENTAL_MODELS = [
  { id: 'first-principles', name: 'First Principles', description: 'Break problems into fundamentals and reason up from truth, not analogy.' },
  { id: 'second-order-thinking', name: 'Second-Order Thinking', description: 'Evaluate downstream effects beyond the immediate result.' },
  { id: 'opportunity-cost', name: 'Opportunity Cost', description: 'Measure every decision against the value of the best alternative.' },
  { id: 'inversion', name: 'Inversion', description: 'Define failure modes first, then design to avoid them.' },
  { id: 'pareto', name: 'Pareto Principle', description: 'Find the vital few inputs driving most outcomes.' },
  { id: 'compounding', name: 'Compounding', description: 'Small consistent gains stack into outsized long-term returns.' },
  { id: 'margin-safety', name: 'Margin of Safety', description: 'Build buffers against uncertainty and downside risk.' },
  { id: 'leverage', name: 'Leverage', description: 'Use code, media, and systems to amplify output per unit effort.' },
  { id: 'circle-competence', name: 'Circle of Competence', description: 'Operate where you deeply understand the domain and constraints.' },
  { id: 'probabilistic-thinking', name: 'Probabilistic Thinking', description: 'Think in odds and ranges, not certainties.' },
  { id: 'bayesian-updating', name: 'Bayesian Updating', description: 'Continuously revise beliefs as new evidence arrives.' },
  { id: 'network-effects', name: 'Network Effects', description: 'Value increases as more users join and interact.' },
  { id: 'switching-costs', name: 'Switching Costs', description: 'Retention strengthens when replacement friction is high.' },
  { id: 'flywheel', name: 'Flywheel', description: 'Design reinforcing loops where one gain powers the next.' },
  { id: 'jobs-to-be-done', name: 'Jobs To Be Done', description: 'Customers hire products to make progress in a context.' },
  { id: 'theory-constraints', name: 'Theory of Constraints', description: 'System output is limited by its narrowest bottleneck.' },
  { id: 'bottleneck-analysis', name: 'Bottleneck Analysis', description: 'Fix the highest-friction point before optimizing elsewhere.' },
  { id: 'ooda-loop', name: 'OODA Loop', description: 'Outperform by observing, orienting, deciding, and acting faster.' },
  { id: 'regret-minimization', name: 'Regret Minimization', description: 'Choose the path that minimizes future regret.' },
  { id: 'survivorship-bias', name: 'Survivorship Bias', description: 'Account for unseen failures, not only visible winners.' },
  { id: 'sunk-cost', name: 'Sunk Cost Fallacy', description: 'Ignore past irrecoverable costs when making forward decisions.' },
  { id: 'confirmation-bias', name: 'Confirmation Bias', description: 'Seek disconfirming evidence to avoid self-reinforcing errors.' },
  { id: 'availability-heuristic', name: 'Availability Heuristic', description: 'Recent vivid examples can distort true probabilities.' },
  { id: 'anchoring', name: 'Anchoring', description: 'First numbers frame perception and negotiation outcomes.' },
  { id: 'loss-aversion', name: 'Loss Aversion', description: 'Losses feel larger than equivalent gains in decision making.' },
  { id: 'incentive-bias', name: 'Incentive-Caused Bias', description: 'Behavior follows incentives, including hidden ones.' },
  { id: 'principal-agent', name: 'Principal-Agent Problem', description: 'Misaligned incentives between owner and operator cause drift.' },
  { id: 'prisoners-dilemma', name: 'Prisoner\'s Dilemma', description: 'Individual incentives can produce collectively bad outcomes.' },
  { id: 'game-theory', name: 'Game Theory', description: 'Model strategic interactions where outcomes depend on others.' },
  { id: 'expected-value', name: 'Expected Value', description: 'Evaluate bets by probability-weighted payoff.' },
  { id: 'unit-economics', name: 'Unit Economics', description: 'Sustainable growth requires healthy per-customer economics.' },
  { id: 'customer-ltv', name: 'Customer Lifetime Value', description: 'Estimate long-term gross profit generated per customer.' },
  { id: 'cohort-retention', name: 'Cohort Retention', description: 'Track behavior by start group to reveal true product health.' },
  { id: 'build-measure-learn', name: 'Build-Measure-Learn', description: 'Run tight learning loops from experiments to insight.' },
  { id: 'mvp', name: 'Minimum Viable Product', description: 'Ship the smallest solution that tests core assumptions.' },
  { id: 'pmf', name: 'Product-Market Fit', description: 'Strong pull exists when users repeatedly derive clear value.' },
  { id: 'diffusion-innovations', name: 'Diffusion of Innovations', description: 'Adoption spreads in segments from early adopters to laggards.' },
  { id: 'innovators-dilemma', name: 'Innovator\'s Dilemma', description: 'Incumbent optimizations can blind teams to disruptive shifts.' },
  { id: 'barbell-strategy', name: 'Barbell Strategy', description: 'Combine safe base bets with high-upside optional bets.' },
  { id: 'optionality', name: 'Optionality', description: 'Prefer paths that preserve and expand future choices.' },
  { id: 'antifragility', name: 'Antifragility', description: 'Design systems that improve under volatility and stress.' },
  { id: 'feedback-loops', name: 'Feedback Loops', description: 'Reinforcing and balancing loops shape system behavior.' },
  { id: 'lead-lag', name: 'Lead and Lag Metrics', description: 'Track both actions (lead) and outcomes (lag) to manage performance.' },
  { id: 'power-laws', name: 'Power Laws', description: 'A small number of inputs drive most returns in many domains.' },
  { id: 'fat-tails', name: 'Fat Tails', description: 'Rare extreme events matter more than normal-distribution assumptions.' },
  { id: 'diminishing-returns', name: 'Diminishing Returns', description: 'Each additional unit of effort can produce less incremental value.' },
  { id: 'eisenhower', name: 'Eisenhower Matrix', description: 'Prioritize by urgency and importance to avoid reactive work.' },
  { id: 'ockham', name: 'Occam\'s Razor', description: 'Prefer the simplest explanation that fits the facts.' },
  { id: 'hanlon', name: 'Hanlon\'s Razor', description: 'Do not assume malice when incompetence explains behavior.' },
  { id: 'five-whys', name: '5 Whys', description: 'Iterate root-cause questions until the true issue surfaces.' }
];

const DEFAULT_AI_PROMPTS = [
  {
    id: 'ai_customer_interview',
    category: 'Customer interview analysis',
    title: 'Interview Insight Synthesizer',
    template: 'Analyze this customer interview transcript. Return: 1) top 5 pain points, 2) language customers use verbatim, 3) purchase triggers, 4) objections, 5) product changes ranked by impact, 6) follow-up questions.'
  },
  {
    id: 'ai_competitive_research',
    category: 'Competitive research',
    title: 'Competitor Teardown Matrix',
    template: 'Compare our product to 5 competitors across ICP, pricing, onboarding friction, retention hooks, and distribution strategy. Provide a strategy table with gaps and winning wedges.'
  },
  {
    id: 'ai_content_creation',
    category: 'Content creation',
    title: 'Founder Content Engine',
    template: 'Turn this insight into 1 LinkedIn post, 1 newsletter section, 1 short video script, and 5 hooks. Keep tone clear, opinionated, and practical with one CTA.'
  },
  {
    id: 'ai_pitch_deck',
    category: 'Pitch deck review',
    title: 'Pitch Deck Red Team',
    template: 'Review this pitch deck like a skeptical Series A partner. Return weaknesses by slide, missing proof points, likely investor objections, and rewrite suggestions.'
  },
  {
    id: 'ai_financial_modeling',
    category: 'Financial modeling',
    title: 'Scenario Financial Model',
    template: 'Build base, upside, and downside forecasts for 18 months. Include MRR, burn, runway, hiring plan, and break-even assumptions. Highlight key sensitivity drivers.'
  },
  {
    id: 'ai_growth_experiments',
    category: 'Growth experiments',
    title: 'Growth Experiment Planner',
    template: 'Generate 10 growth experiments for this stage. For each include hypothesis, channel, expected impact, effort score, success metric, and stop criteria.'
  }
];

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function nowISO() {
  return new Date().toISOString();
}

function toDateISO(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

function toMonthISO(date = new Date()) {
  return new Date(date).toISOString().slice(0, 7);
}

function toWeekStartISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function toWeekStartFromISO(dateString) {
  if (!dateString) return toWeekStartISO();
  const d = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(d.getTime())) return toWeekStartISO();
  return toWeekStartISO(d);
}

function monthDiff(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(num(value) * factor) / factor;
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num(value));
}

function formatPct(value) {
  return `${round(value, 1)}%`;
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function normalizeDateList(values) {
  const unique = new Set();
  if (Array.isArray(values)) {
    values.forEach((value) => {
      const date = String(value || '').slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) unique.add(date);
    });
  }
  return [...unique].sort().slice(-400);
}

function getDateStreak(values, fromDate = toDateISO()) {
  const dateSet = new Set(normalizeDateList(values));
  const cursor = new Date(`${fromDate}T00:00:00`);
  if (Number.isNaN(cursor.getTime())) return 0;
  let streak = 0;
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function statusClass(status) {
  if (status === 'Complete') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
  if (status === 'In Progress') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  return 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300';
}

function progressClass(progress) {
  if (progress >= 80) return 'bg-emerald-500';
  if (progress >= 40) return 'bg-amber-500';
  return 'bg-rose-500';
}

function growthClass(growth) {
  if (num(growth) > 10) return 'text-emerald-500';
  if (num(growth) >= 0) return 'text-amber-500';
  return 'text-rose-500';
}

function cloneData(data) {
  if (typeof structuredClone === 'function') {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
}

function createRoadmap() {
  return ROADMAP_TEMPLATE.map((item) => ({
    id: `month_${item.month}`,
    month: item.month,
    title: item.title,
    status: 'Not Started',
    progress: 0,
    exitCriteria: item.exitCriteria.map((text) => ({
      id: uid('exit'),
      text,
      done: false,
      createdAt: nowISO(),
      updatedAt: nowISO()
    })),
    activities: item.activities.map((text) => ({
      id: uid('activity'),
      text,
      done: false,
      createdAt: nowISO(),
      updatedAt: nowISO()
    })),
    createdAt: nowISO(),
    updatedAt: nowISO()
  }));
}

function createDefaultPlaybooks() {
  return PLAYBOOK_TYPES.map((type) => ({
    id: uid('playbook'),
    type,
    title: `${type} Playbook`,
    content: '',
    createdAt: nowISO(),
    updatedAt: nowISO()
  }));
}

function createDefaultNonNegotiables() {
  return NON_NEGOTIABLES_TEMPLATE.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    completionDates: [],
    createdAt: nowISO(),
    updatedAt: nowISO()
  }));
}

function createDocumentLibrary() {
  return DOCUMENT_LIBRARY_TEMPLATE.map((doc) => ({
    id: doc.id,
    title: doc.title,
    sourceFile: doc.sourceFile,
    sections: doc.sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      createdAt: nowISO(),
      updatedAt: nowISO()
    })),
    createdAt: nowISO(),
    updatedAt: nowISO()
  }));
}

function createFounderManualState() {
  return {
    brutalTruths: BRUTAL_TRUTHS.map((text, index) => ({
      id: `truth_${index + 1}`,
      text,
      acknowledged: false,
      note: ''
    })),
    dailySchedule: DAILY_EXECUTION_SCHEDULE.map((item) => ({
      id: item.id,
      done: false,
      note: ''
    })),
    weeklyModel: WEEKLY_OPERATING_MODEL.map((item) => ({
      id: item.id,
      done: false,
      outputLog: ''
    })),
    validationFunnel: VALIDATION_FUNNEL.map((item) => ({
      id: item.id,
      passed: false,
      killed: false,
      notes: ''
    })),
    distractionAudit: DISTRACTION_AUDIT.map((item) => ({
      id: item.id,
      enabled: false,
      notes: ''
    })),
    dailyMetrics: DAILY_METRIC_TEMPLATE.map((item) => ({
      id: item.id,
      actual: '',
      status: ''
    })),
    weeklyMetrics: WEEKLY_METRIC_TEMPLATE.map((item) => ({
      id: item.id,
      actual: '',
      status: ''
    })),
    monthlyScorecard: MONTHLY_SCORECARD_TEMPLATE.map((item) => ({
      id: item.id,
      actual: '',
      status: ''
    })),
    sectorDecisions: SECTOR_PRIORITIES.map((item) => ({
      id: item.id,
      decision: '',
      notes: ''
    })),
    thirtyDayPlan: THIRTY_DAY_PLAN.map((item) => ({
      id: item.id,
      done: false,
      notes: ''
    })),
    forcingQuestions: WEEKLY_FORCING_QUESTIONS.map((item) => ({
      id: item.id,
      answer: ''
    })),
    monthlyReview: MONTHLY_REVIEW_CHECKS.map((item) => ({
      id: item.id,
      done: false,
      notes: ''
    })),
    tenTenTen: {
      day10: '',
      month10: '',
      year10: '',
      hellYes: ''
    },
    updatedAt: nowISO()
  };
}

function createDefaultData() {
  return {
    version: 1,
    settings: {
      startDate: toDateISO(),
      manualJourneyMonth: null,
      darkMode: false
    },
    dashboard: {
      weeklyGoals: [
        { id: uid('goal'), text: 'Speak with 10 customers this week', completed: false, createdAt: nowISO(), updatedAt: nowISO() },
        { id: uid('goal'), text: 'Ship one high-impact product improvement', completed: false, createdAt: nowISO(), updatedAt: nowISO() },
        { id: uid('goal'), text: 'Run one growth experiment end-to-end', completed: false, createdAt: nowISO(), updatedAt: nowISO() }
      ],
      nonNegotiables: createDefaultNonNegotiables()
    },
    metricsSnapshots: [
      {
        id: uid('snap'),
        date: toDateISO(),
        mrr: 0,
        arr: 0,
        customers: 0,
        wau: 0,
        momGrowth: 0,
        runwayMonths: 12,
        conversations: 0,
        burnRate: 12000,
        cashInBank: 144000,
        createdAt: nowISO(),
        updatedAt: nowISO()
      }
    ],
    execution: {
      months: createRoadmap()
    },
    learning: {
      booksRead: 0,
      booksGoal: 100,
      mentalModelsMastered: [],
      learningHours: [
        { id: uid('hours'), weekStart: toWeekStartISO(), hours: 0, createdAt: nowISO(), updatedAt: nowISO() }
      ],
      courses: [],
      domainExpertise: 1,
      aiHoursSaved: 0
    },
    decisions: [],
    knowledge: {
      journals: [],
      weeklyReviews: [],
      playbooks: createDefaultPlaybooks(),
      customerInterviews: []
    },
    metrics: {
      unitEconomics: {
        arpu: 200,
        grossMarginPct: 80,
        monthlyChurnPct: 5,
        cac: 1200
      },
      cohorts: [
        {
          id: uid('cohort'),
          name: 'Pilot Cohort',
          startMonth: toMonthISO(),
          users: 20,
          retention: [100, 80, 68, 60, 55, 50],
          createdAt: nowISO(),
          updatedAt: nowISO()
        }
      ],
      fundraising: {
        target: 2500000,
        raised: 0,
        runwayExtensionMonths: 0
      }
    },
    aiWorkflows: DEFAULT_AI_PROMPTS.map((item) => ({ ...item, createdAt: nowISO(), updatedAt: nowISO() })),
    weeklyRhythm: {
      logs: []
    },
    reports: [],
    logbook: [],
    documents: createDocumentLibrary(),
    manual: createFounderManualState()
  };
}

function refreshMonthProgress(month) {
  const criteriaCount = month.exitCriteria.length;
  const activityCount = month.activities.length;
  const total = criteriaCount + activityCount;
  if (total === 0) {
    month.progress = 0;
    month.status = 'Not Started';
    month.updatedAt = nowISO();
    return;
  }
  const done = month.exitCriteria.filter((item) => item.done).length + month.activities.filter((item) => item.done).length;
  const progress = Math.round((done / total) * 100);
  month.progress = progress;
  if (progress === 100) month.status = 'Complete';
  else if (progress > 0) month.status = 'In Progress';
  else month.status = 'Not Started';
  month.updatedAt = nowISO();
}

function normalizeRoadmap(months) {
  const fallback = createRoadmap();
  if (!Array.isArray(months) || months.length === 0) return fallback;

  const byMonth = new Map(months.map((item) => [item.month, item]));
  return ROADMAP_TEMPLATE.map((template, index) => {
    const source = byMonth.get(template.month) || months[index] || {};
    const month = {
      id: source.id || `month_${template.month}`,
      month: template.month,
      title: source.title || template.title,
      status: source.status || 'Not Started',
      progress: num(source.progress),
      exitCriteria: Array.isArray(source.exitCriteria)
        ? source.exitCriteria.map((item) => ({
          id: item.id || uid('exit'),
          text: item.text || '',
          done: Boolean(item.done),
          createdAt: item.createdAt || nowISO(),
          updatedAt: item.updatedAt || nowISO()
        }))
        : template.exitCriteria.map((text) => ({ id: uid('exit'), text, done: false, createdAt: nowISO(), updatedAt: nowISO() })),
      activities: Array.isArray(source.activities)
        ? source.activities.map((item) => ({
          id: item.id || uid('activity'),
          text: item.text || '',
          done: Boolean(item.done),
          createdAt: item.createdAt || nowISO(),
          updatedAt: item.updatedAt || nowISO()
        }))
        : template.activities.map((text) => ({ id: uid('activity'), text, done: false, createdAt: nowISO(), updatedAt: nowISO() })),
      createdAt: source.createdAt || nowISO(),
      updatedAt: source.updatedAt || nowISO()
    };
    refreshMonthProgress(month);
    return month;
  });
}

function normalizeData(rawData) {
  const defaults = createDefaultData();
  const raw = rawData && typeof rawData === 'object' ? rawData : {};
  const alignById = (defaultsList, rawList) => {
    const byId = new Map((Array.isArray(rawList) ? rawList : []).map((item) => [item.id, item]));
    return defaultsList.map((base) => ({ ...base, ...(byId.get(base.id) || {}) }));
  };

  const merged = {
    ...defaults,
    ...raw,
    settings: {
      ...defaults.settings,
      ...(raw.settings || {})
    },
    dashboard: {
      ...defaults.dashboard,
      ...(raw.dashboard || {}),
      weeklyGoals: Array.isArray(raw.dashboard?.weeklyGoals)
        ? raw.dashboard.weeklyGoals.map((goal) => ({
          id: goal.id || uid('goal'),
          text: goal.text || '',
          completed: Boolean(goal.completed),
          createdAt: goal.createdAt || nowISO(),
          updatedAt: goal.updatedAt || nowISO()
        }))
        : defaults.dashboard.weeklyGoals,
      nonNegotiables: Array.isArray(raw.dashboard?.nonNegotiables)
        ? raw.dashboard.nonNegotiables.map((item, index) => {
          const fallback = NON_NEGOTIABLES_TEMPLATE.find((entry) => entry.id === item.id)
            || NON_NEGOTIABLES_TEMPLATE[index]
            || {};
          return {
            id: item.id || fallback.id || uid('nn'),
            title: item.title || fallback.title || '',
            description: item.description || fallback.description || '',
            completionDates: normalizeDateList(item.completionDates),
            createdAt: item.createdAt || nowISO(),
            updatedAt: item.updatedAt || nowISO()
          };
        })
        : defaults.dashboard.nonNegotiables
    },
    metricsSnapshots: Array.isArray(raw.metricsSnapshots) && raw.metricsSnapshots.length
      ? raw.metricsSnapshots.map((snap) => {
        const burn = num(snap.burnRate);
        const cash = num(snap.cashInBank);
        const autoRunway = burn > 0 ? round(cash / burn, 1) : num(snap.runwayMonths);
        return {
          id: snap.id || uid('snap'),
          date: snap.date || toDateISO(),
          mrr: num(snap.mrr),
          arr: snap.arr != null ? num(snap.arr) : num(snap.mrr) * 12,
          customers: num(snap.customers),
          wau: num(snap.wau),
          momGrowth: num(snap.momGrowth),
          runwayMonths: snap.runwayMonths != null ? num(snap.runwayMonths) : autoRunway,
          conversations: num(snap.conversations),
          burnRate: burn,
          cashInBank: cash,
          createdAt: snap.createdAt || nowISO(),
          updatedAt: snap.updatedAt || nowISO()
        };
      })
      : defaults.metricsSnapshots,
    execution: {
      months: normalizeRoadmap(raw.execution?.months)
    },
    learning: {
      ...defaults.learning,
      ...(raw.learning || {}),
      booksRead: num(raw.learning?.booksRead ?? defaults.learning.booksRead),
      booksGoal: num(raw.learning?.booksGoal ?? defaults.learning.booksGoal),
      mentalModelsMastered: Array.isArray(raw.learning?.mentalModelsMastered)
        ? raw.learning.mentalModelsMastered
        : defaults.learning.mentalModelsMastered,
      learningHours: Array.isArray(raw.learning?.learningHours)
        ? raw.learning.learningHours.map((entry) => ({
          id: entry.id || uid('hours'),
          weekStart: entry.weekStart || toWeekStartISO(),
          hours: num(entry.hours),
          createdAt: entry.createdAt || nowISO(),
          updatedAt: entry.updatedAt || nowISO()
        }))
        : defaults.learning.learningHours,
      courses: Array.isArray(raw.learning?.courses)
        ? raw.learning.courses.map((course) => ({
          id: course.id || uid('course'),
          title: course.title || '',
          resourceType: course.resourceType || 'Course',
          completed: Boolean(course.completed),
          notes: course.notes || '',
          createdAt: course.createdAt || nowISO(),
          updatedAt: course.updatedAt || nowISO()
        }))
        : defaults.learning.courses,
      domainExpertise: clamp(num(raw.learning?.domainExpertise ?? defaults.learning.domainExpertise), 1, 10),
      aiHoursSaved: num(raw.learning?.aiHoursSaved ?? defaults.learning.aiHoursSaved)
    },
    decisions: Array.isArray(raw.decisions)
      ? raw.decisions.map((decision) => ({
        id: decision.id || uid('decision'),
        date: decision.date || toDateISO(),
        category: decision.category || 'Operations',
        statement: decision.statement || '',
        optionsConsidered: decision.optionsConsidered || '',
        chosenOption: decision.chosenOption || '',
        reasoning: decision.reasoning || '',
        expectedOutcomes: decision.expectedOutcomes || '',
        reversalCriteria: decision.reversalCriteria || '',
        mentalModelsUsed: Array.isArray(decision.mentalModelsUsed)
          ? decision.mentalModelsUsed
          : (decision.mentalModelsUsed || '').split(',').map((item) => item.trim()).filter(Boolean),
        createdAt: decision.createdAt || nowISO(),
        updatedAt: decision.updatedAt || nowISO()
      }))
      : defaults.decisions,
    knowledge: {
      ...defaults.knowledge,
      ...(raw.knowledge || {}),
      journals: Array.isArray(raw.knowledge?.journals)
        ? raw.knowledge.journals.map((entry) => ({
          id: entry.id || uid('journal'),
          date: entry.date || toDateISO(),
          worked: entry.worked || '',
          didntWork: entry.didntWork || '',
          learnings: entry.learnings || '',
          createdAt: entry.createdAt || nowISO(),
          updatedAt: entry.updatedAt || nowISO()
        }))
        : defaults.knowledge.journals,
      weeklyReviews: Array.isArray(raw.knowledge?.weeklyReviews)
        ? raw.knowledge.weeklyReviews.map((entry) => ({
          id: entry.id || uid('review'),
          weekStart: entry.weekStart || toWeekStartISO(),
          summary: entry.summary || '',
          wins: entry.wins || '',
          misses: entry.misses || '',
          nextFocus: entry.nextFocus || '',
          createdAt: entry.createdAt || nowISO(),
          updatedAt: entry.updatedAt || nowISO()
        }))
        : defaults.knowledge.weeklyReviews,
      playbooks: Array.isArray(raw.knowledge?.playbooks) && raw.knowledge.playbooks.length
        ? raw.knowledge.playbooks.map((entry) => ({
          id: entry.id || uid('playbook'),
          type: entry.type || 'Product',
          title: entry.title || '',
          content: entry.content || '',
          createdAt: entry.createdAt || nowISO(),
          updatedAt: entry.updatedAt || nowISO()
        }))
        : defaults.knowledge.playbooks,
      customerInterviews: Array.isArray(raw.knowledge?.customerInterviews)
        ? raw.knowledge.customerInterviews.map((entry) => ({
          id: entry.id || uid('interview'),
          date: entry.date || toDateISO(),
          customer: entry.customer || '',
          notes: entry.notes || '',
          insights: entry.insights || '',
          nextSteps: entry.nextSteps || '',
          createdAt: entry.createdAt || nowISO(),
          updatedAt: entry.updatedAt || nowISO()
        }))
        : defaults.knowledge.customerInterviews
    },
    metrics: {
      ...defaults.metrics,
      ...(raw.metrics || {}),
      unitEconomics: {
        ...defaults.metrics.unitEconomics,
        ...(raw.metrics?.unitEconomics || {})
      },
      cohorts: Array.isArray(raw.metrics?.cohorts) && raw.metrics.cohorts.length
        ? raw.metrics.cohorts.map((cohort) => ({
          id: cohort.id || uid('cohort'),
          name: cohort.name || '',
          startMonth: cohort.startMonth || toMonthISO(),
          users: num(cohort.users),
          retention: Array.isArray(cohort.retention)
            ? cohort.retention.slice(0, 6).map((value) => num(value))
            : [100, 0, 0, 0, 0, 0],
          createdAt: cohort.createdAt || nowISO(),
          updatedAt: cohort.updatedAt || nowISO()
        }))
        : defaults.metrics.cohorts,
      fundraising: {
        ...defaults.metrics.fundraising,
        ...(raw.metrics?.fundraising || {})
      }
    },
    aiWorkflows: Array.isArray(raw.aiWorkflows) && raw.aiWorkflows.length
      ? raw.aiWorkflows.map((item) => ({
        id: item.id || uid('ai'),
        category: item.category || 'General',
        title: item.title || '',
        template: item.template || '',
        createdAt: item.createdAt || nowISO(),
        updatedAt: item.updatedAt || nowISO()
      }))
      : defaults.aiWorkflows,
    weeklyRhythm: {
      logs: Array.isArray(raw.weeklyRhythm?.logs)
        ? raw.weeklyRhythm.logs.map((entry) => ({
          id: entry.id || uid('rhythm'),
          weekStart: entry.weekStart || toWeekStartISO(),
          dayKey: entry.dayKey || 'monday',
          content: entry.content || '',
          complete: Boolean(entry.complete),
          createdAt: entry.createdAt || nowISO(),
          updatedAt: entry.updatedAt || nowISO()
        }))
        : defaults.weeklyRhythm.logs
    },
    reports: Array.isArray(raw.reports)
      ? raw.reports.map((report) => ({
        id: report.id || uid('report'),
        type: report.type || 'weekly',
        period: report.period || toWeekStartISO(),
        generatedAt: report.generatedAt || nowISO(),
        snapshot: report.snapshot || {}
      }))
      : defaults.reports,
    logbook: Array.isArray(raw.logbook)
      ? raw.logbook.map((entry) => ({
        id: entry.id || uid('log'),
        date: entry.date || toDateISO(),
        category: entry.category || 'General',
        title: entry.title || '',
        content: entry.content || '',
        tags: Array.isArray(entry.tags)
          ? entry.tags.map((tag) => String(tag).trim()).filter(Boolean)
          : String(entry.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
        createdAt: entry.createdAt || nowISO(),
        updatedAt: entry.updatedAt || nowISO()
      }))
      : defaults.logbook,
    documents: Array.isArray(raw.documents)
      ? raw.documents.map((doc, docIndex) => {
        const fallbackDoc = DOCUMENT_LIBRARY_TEMPLATE.find((item) => item.id === doc.id)
          || DOCUMENT_LIBRARY_TEMPLATE[docIndex]
          || { sections: [] };
        const fallbackSections = Array.isArray(fallbackDoc.sections) ? fallbackDoc.sections : [];
        return {
          id: doc.id || fallbackDoc.id || uid('doc'),
          title: doc.title || fallbackDoc.title || 'Untitled Document',
          sourceFile: doc.sourceFile || fallbackDoc.sourceFile || '',
          sections: Array.isArray(doc.sections)
            ? doc.sections.map((section, sectionIndex) => {
              const fallbackSection = fallbackSections.find((item) => item.id === section.id)
                || fallbackSections[sectionIndex]
                || {};
              return {
                id: section.id || fallbackSection.id || uid('section'),
                title: section.title || fallbackSection.title || 'Untitled Section',
                content: section.content || fallbackSection.content || '',
                createdAt: section.createdAt || nowISO(),
                updatedAt: section.updatedAt || nowISO()
              };
            })
            : fallbackSections.map((section) => ({
              id: section.id || uid('section'),
              title: section.title || 'Untitled Section',
              content: section.content || '',
              createdAt: nowISO(),
              updatedAt: nowISO()
            })),
          createdAt: doc.createdAt || nowISO(),
          updatedAt: doc.updatedAt || nowISO()
        };
      })
      : defaults.documents,
    manual: raw.manual && typeof raw.manual === 'object'
      ? {
        ...defaults.manual,
        ...raw.manual,
        brutalTruths: alignById(defaults.manual.brutalTruths, raw.manual.brutalTruths),
        dailySchedule: alignById(defaults.manual.dailySchedule, raw.manual.dailySchedule),
        weeklyModel: alignById(defaults.manual.weeklyModel, raw.manual.weeklyModel),
        validationFunnel: alignById(defaults.manual.validationFunnel, raw.manual.validationFunnel),
        distractionAudit: alignById(defaults.manual.distractionAudit, raw.manual.distractionAudit),
        dailyMetrics: alignById(defaults.manual.dailyMetrics, raw.manual.dailyMetrics),
        weeklyMetrics: alignById(defaults.manual.weeklyMetrics, raw.manual.weeklyMetrics),
        monthlyScorecard: alignById(defaults.manual.monthlyScorecard, raw.manual.monthlyScorecard),
        sectorDecisions: alignById(defaults.manual.sectorDecisions, raw.manual.sectorDecisions),
        thirtyDayPlan: alignById(defaults.manual.thirtyDayPlan, raw.manual.thirtyDayPlan),
        forcingQuestions: alignById(defaults.manual.forcingQuestions, raw.manual.forcingQuestions),
        monthlyReview: alignById(defaults.manual.monthlyReview, raw.manual.monthlyReview),
        tenTenTen: {
          ...defaults.manual.tenTenTen,
          ...(raw.manual.tenTenTen || {})
        },
        updatedAt: raw.manual.updatedAt || nowISO()
      }
      : defaults.manual
  };

  merged.metricsSnapshots.sort((a, b) => a.date.localeCompare(b.date));
  merged.decisions.sort((a, b) => b.date.localeCompare(a.date));
  merged.knowledge.journals.sort((a, b) => b.date.localeCompare(a.date));
  merged.knowledge.customerInterviews.sort((a, b) => b.date.localeCompare(a.date));
  merged.learning.learningHours.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  merged.knowledge.weeklyReviews.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  merged.reports.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  merged.logbook.sort((a, b) => {
    const aKey = `${a.date} ${a.updatedAt || a.createdAt || ''}`;
    const bKey = `${b.date} ${b.updatedAt || b.createdAt || ''}`;
    return bKey.localeCompare(aKey);
  });
  merged.documents = Array.isArray(merged.documents) ? merged.documents.map((doc) => ({
    ...doc,
    sections: Array.isArray(doc.sections)
      ? doc.sections.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
      : []
  })) : [];

  return merged;
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();
    const parsed = JSON.parse(raw);
    return normalizeData(parsed);
  } catch (error) {
    console.error('Failed to load local data:', error);
    return createDefaultData();
  }
}

function calculateJourneyMonth(data) {
  if (data.settings.manualJourneyMonth) return clamp(num(data.settings.manualJourneyMonth), 1, 12);
  const months = monthDiff(data.settings.startDate, new Date());
  return clamp(months + 1, 1, 12);
}

function getLatestSnapshot(data) {
  const snapshots = [...data.metricsSnapshots].sort((a, b) => a.date.localeCompare(b.date));
  return snapshots[snapshots.length - 1] || null;
}

function getJournalStreak(journals) {
  const dateSet = new Set(journals.map((entry) => entry.date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getWeeklyRhythmStreak(logs) {
  const weekly = {};
  logs.forEach((log) => {
    if (!log.complete) return;
    if (!weekly[log.weekStart]) weekly[log.weekStart] = new Set();
    weekly[log.weekStart].add(log.dayKey);
  });

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const currentWeekStart = toWeekStartISO(cursor);
  let weekCursor = new Date(`${currentWeekStart}T00:00:00`);

  while (true) {
    const key = weekCursor.toISOString().slice(0, 10);
    const set = weekly[key];
    const complete = set && RHYTHM_DAYS.every((day) => set.has(day.key));
    if (!complete) break;
    streak += 1;
    weekCursor.setDate(weekCursor.getDate() - 7);
  }

  return streak;
}

function getCurrentWeekRhythmCompletion(logs) {
  const week = toWeekStartISO();
  const weekLogs = logs.filter((item) => item.weekStart === week);
  const done = RHYTHM_DAYS.filter((day) => weekLogs.some((log) => log.dayKey === day.key && log.complete)).length;
  return Math.round((done / RHYTHM_DAYS.length) * 100);
}

function getConsistencyScore(data) {
  const goals = data.dashboard.weeklyGoals.slice(0, 3);
  const goalCompletion = goals.length ? goals.filter((goal) => goal.completed).length / goals.length : 0;
  const rhythmCompletion = getCurrentWeekRhythmCompletion(data.weeklyRhythm.logs) / 100;
  const currentWeekHours = data.learning.learningHours.find((entry) => entry.weekStart === toWeekStartISO());
  const learningCompletion = Math.min(num(currentWeekHours?.hours) / 10, 1);
  const today = toDateISO();
  const nonNegotiables = Array.isArray(data.dashboard.nonNegotiables) ? data.dashboard.nonNegotiables : [];
  const nonNegotiableCompletion = nonNegotiables.length
    ? nonNegotiables.filter((item) => Array.isArray(item.completionDates) && item.completionDates.includes(today)).length / nonNegotiables.length
    : 0;
  return Math.round((goalCompletion * 0.3 + rhythmCompletion * 0.3 + learningCompletion * 0.2 + nonNegotiableCompletion * 0.2) * 100);
}

function buildAutomatedWeeklySummary(data, weekStart) {
  const weekLogs = data.weeklyRhythm.logs.filter((entry) => entry.weekStart === weekStart);
  const completedDays = RHYTHM_DAYS.filter((day) => weekLogs.some((log) => log.dayKey === day.key && log.complete)).length;
  const latest = getLatestSnapshot(data);
  const goalDone = data.dashboard.weeklyGoals.filter((goal) => goal.completed).length;
  const topNotes = weekLogs
    .filter((entry) => entry.content.trim())
    .map((entry) => {
      const day = RHYTHM_DAYS.find((d) => d.key === entry.dayKey);
      return `${day?.day || entry.dayKey}: ${entry.content.slice(0, 140)}`;
    })
    .slice(0, 3)
    .join('\n');

  return `Week of ${weekStart}\n\nExecution: ${completedDays}/${RHYTHM_DAYS.length} rhythm days completed.\nGoals: ${goalDone}/${data.dashboard.weeklyGoals.length} weekly goals completed.\nRevenue: ${formatMoney(latest?.mrr || 0)} MRR | Growth: ${formatPct(latest?.momGrowth || 0)} | Conversations: ${latest?.conversations || 0}.\n\nHighlights:\n${topNotes || 'No detailed logs were added this week.'}\n\nNext Week Focus:\n- One retention improvement\n- One growth experiment\n- One founder sales motion`;
}

function createReport(data, type) {
  const latest = getLatestSnapshot(data);
  const weekStart = toWeekStartISO();
  const month = toMonthISO();
  const weeklyCompletion = getCurrentWeekRhythmCompletion(data.weeklyRhythm.logs);
  const today = toDateISO();
  const nonNegotiables = Array.isArray(data.dashboard.nonNegotiables) ? data.dashboard.nonNegotiables : [];
  const nonNegotiablesToday = nonNegotiables.length
    ? Math.round((nonNegotiables.filter((item) => Array.isArray(item.completionDates) && item.completionDates.includes(today)).length / nonNegotiables.length) * 100)
    : 0;
  const report = {
    id: uid('report'),
    type,
    period: type === 'weekly' ? weekStart : month,
    generatedAt: nowISO(),
    snapshot: {
      journeyMonth: calculateJourneyMonth(data),
      mrr: latest?.mrr || 0,
      customers: latest?.customers || 0,
      wau: latest?.wau || 0,
      growth: latest?.momGrowth || 0,
      runwayMonths: latest?.runwayMonths || 0,
      conversations: latest?.conversations || 0,
      weeklyGoalCompletion: data.dashboard.weeklyGoals.length
        ? Math.round((data.dashboard.weeklyGoals.filter((goal) => goal.completed).length / data.dashboard.weeklyGoals.length) * 100)
        : 0,
      nonNegotiablesTodayCompletion: nonNegotiablesToday,
      rhythmCompletion: weeklyCompletion,
      booksRead: data.learning.booksRead,
      modelsMastered: data.learning.mentalModelsMastered.length
    }
  };
  return report;
}

function ProgressBar({ progress }) {
  return (
    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${progressClass(progress)}`}
        style={{ width: `${clamp(num(progress), 0, 100)}%` }}
      />
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(status)}`}>
      {status}
    </span>
  );
}

function MetricCard({ title, value, subtitle, tone = 'default' }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-200 dark:border-emerald-800/50'
      : tone === 'warn'
        ? 'border-amber-200 dark:border-amber-800/50'
        : tone === 'bad'
          ? 'border-rose-200 dark:border-rose-800/50'
          : 'border-slate-200 dark:border-slate-700';

  return (
    <div className={`card-panel p-4 border ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold font-heading text-slate-900 dark:text-slate-100">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = 'max-w-3xl' }) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/55" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} card-panel bg-white dark:bg-slate-900 max-h-[90vh] overflow-auto`}> 
        <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">{title}</h3>
          <button
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

function LineChart({ data, metricKey = 'mrr' }) {
  if (!data.length) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">No data points yet.</div>;
  }

  const width = 720;
  const height = 240;
  const pad = 30;
  const values = data.map((item) => num(item[metricKey]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(values.length - 1, 1);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[620px] h-60">
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0ea5a3" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0ea5a3" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#475569" strokeOpacity="0.25" />
        <polyline fill="none" stroke="#0ea5a3" strokeWidth="3" points={points.join(' ')} strokeLinecap="round" />
        <polygon
          fill="url(#chartGradient)"
          points={`${points.join(' ')} ${width - pad},${height - pad} ${pad},${height - pad}`}
        />
        {points.map((point, index) => {
          const [x, y] = point.split(',').map(Number);
          const isEdge = index === 0 || index === points.length - 1;
          return (
            <g key={`${point}_${index}`}>
              <circle cx={x} cy={y} r="4" fill="#0f766e" />
              {isEdge ? (
                <text x={x} y={y - 10} fill="#334155" fontSize="11" textAnchor="middle">
                  {round(values[index], 0)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DashboardView({
  data,
  currentMonth,
  currentRoadmap,
  latestSnapshot,
  updateData,
  setActiveView,
  onGenerateReport,
  journalStreak,
  rhythmStreak,
  consistencyScore
}) {
  const [nonNegotiableDraft, setNonNegotiableDraft] = useState({ title: '', description: '' });
  const topGoals = data.dashboard.weeklyGoals.slice(0, 3);
  const todayKey = toDateISO();
  const nonNegotiables = Array.isArray(data.dashboard.nonNegotiables) ? data.dashboard.nonNegotiables : [];

  const goalCompletion = topGoals.length
    ? Math.round((topGoals.filter((goal) => goal.completed).length / topGoals.length) * 100)
    : 0;
  const nonNegotiableDoneCount = nonNegotiables.filter((item) => Array.isArray(item.completionDates) && item.completionDates.includes(todayKey)).length;
  const nonNegotiableProgress = nonNegotiables.length
    ? Math.round((nonNegotiableDoneCount / nonNegotiables.length) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-slideFade">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="MRR / ARR" value={`${formatMoney(latestSnapshot?.mrr || 0)} / ${formatMoney(latestSnapshot?.arr || 0)}`} />
        <MetricCard title="Customers" value={latestSnapshot?.customers || 0} subtitle={`${latestSnapshot?.wau || 0} weekly active users`} />
        <MetricCard title="MoM Growth" value={formatPct(latestSnapshot?.momGrowth || 0)} subtitle="Month-over-month" tone={num(latestSnapshot?.momGrowth) > 10 ? 'good' : num(latestSnapshot?.momGrowth) >= 0 ? 'warn' : 'bad'} />
        <MetricCard title="Runway" value={`${round(latestSnapshot?.runwayMonths || 0, 1)} months`} subtitle={`Burn ${formatMoney(latestSnapshot?.burnRate || 0)}/mo`} tone={num(latestSnapshot?.runwayMonths) >= 12 ? 'good' : num(latestSnapshot?.runwayMonths) >= 6 ? 'warn' : 'bad'} />
        <MetricCard title="Customer Conversations" value={latestSnapshot?.conversations || 0} subtitle="This week" />
        <MetricCard title="Consistency Score" value={`${consistencyScore}%`} subtitle="Goals + non-negotiables + rhythm + learning" tone={consistencyScore >= 75 ? 'good' : consistencyScore >= 45 ? 'warn' : 'bad'} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card-panel p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h3 className="font-heading text-lg font-semibold">Weekly Top 3 Goals</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Editable and tracked with completion.</p>
            </div>
            <button
              disabled={data.dashboard.weeklyGoals.length >= 3}
              onClick={() => updateData((draft) => {
                if (draft.dashboard.weeklyGoals.length >= 3) return;
                draft.dashboard.weeklyGoals.push({
                  id: uid('goal'),
                  text: '',
                  completed: false,
                  createdAt: nowISO(),
                  updatedAt: nowISO()
                });
              })}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Goal
            </button>
          </div>

          <div className="space-y-3">
            {topGoals.map((goal, index) => (
              <div key={goal.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={(event) => {
                    updateData((draft) => {
                      const target = draft.dashboard.weeklyGoals.find((item) => item.id === goal.id);
                      if (!target) return;
                      target.completed = event.target.checked;
                      target.updatedAt = nowISO();
                    });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs font-semibold w-10 text-slate-500">Goal {index + 1}</span>
                <input
                  value={goal.text}
                  onChange={(event) => {
                    const text = event.target.value;
                    updateData((draft) => {
                      const target = draft.dashboard.weeklyGoals.find((item) => item.id === goal.id);
                      if (!target) return;
                      target.text = text;
                      target.updatedAt = nowISO();
                    });
                  }}
                  placeholder="Define measurable weekly outcome"
                  className="input-field flex-1"
                />
                <button
                  onClick={() => {
                    if (!window.confirm('Delete this goal?')) return;
                    updateData((draft) => {
                      draft.dashboard.weeklyGoals = draft.dashboard.weeklyGoals.filter((item) => item.id !== goal.id);
                    });
                  }}
                  className="btn-danger px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
              <span>Goal completion</span>
              <span>{goalCompletion}%</span>
            </div>
            <ProgressBar progress={goalCompletion} />
          </div>
        </article>

        <article className="card-panel p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Phase</p>
            <h3 className="font-heading text-lg font-semibold mt-1">Month {currentMonth}: {currentRoadmap?.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <StatusPill status={currentRoadmap?.status || 'Not Started'} />
              <span className="text-sm text-slate-500 dark:text-slate-400">{currentRoadmap?.progress || 0}% complete</span>
            </div>
            <div className="mt-3"><ProgressBar progress={currentRoadmap?.progress || 0} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MetricCard title="Journal Streak" value={`${journalStreak}d`} subtitle="Daily entries" tone={journalStreak >= 7 ? 'good' : journalStreak >= 3 ? 'warn' : 'bad'} />
            <MetricCard title="Rhythm Streak" value={`${rhythmStreak}w`} subtitle="Full week cadence" tone={rhythmStreak >= 3 ? 'good' : rhythmStreak >= 1 ? 'warn' : 'bad'} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card-panel p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div>
              <h3 className="font-heading text-lg font-semibold">Daily Non-Negotiables</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Doc-driven recurring todos. If you complete today, it automatically resets tomorrow.</p>
            </div>
            <span className="metric-pill">{nonNegotiableDoneCount}/{nonNegotiables.length || 0} done today</span>
          </div>

          <div className="space-y-2">
            {nonNegotiables.length === 0 ? <p className="text-sm text-slate-500">No non-negotiables yet. Add your first one.</p> : null}
            {nonNegotiables.map((item) => {
              const doneToday = Array.isArray(item.completionDates) && item.completionDates.includes(todayKey);
              const streak = getDateStreak(item.completionDates, todayKey);
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={doneToday}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        updateData((draft) => {
                          const list = Array.isArray(draft.dashboard.nonNegotiables) ? draft.dashboard.nonNegotiables : [];
                          const target = list.find((entry) => entry.id === item.id);
                          if (!target) return;
                          const set = new Set(normalizeDateList(target.completionDates));
                          if (checked) set.add(todayKey);
                          else set.delete(todayKey);
                          target.completionDates = normalizeDateList([...set]);
                          target.updatedAt = nowISO();
                        });
                      }}
                      className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex-1 grid gap-2 md:grid-cols-[1fr_1.2fr]">
                      <input
                        className="input-field"
                        value={item.title}
                        onChange={(event) => {
                          const value = event.target.value;
                          updateData((draft) => {
                            const target = draft.dashboard.nonNegotiables.find((entry) => entry.id === item.id);
                            if (!target) return;
                            target.title = value;
                            target.updatedAt = nowISO();
                          });
                        }}
                        placeholder="Non-negotiable task"
                      />
                      <input
                        className="input-field"
                        value={item.description || ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          updateData((draft) => {
                            const target = draft.dashboard.nonNegotiables.find((entry) => entry.id === item.id);
                            if (!target) return;
                            target.description = value;
                            target.updatedAt = nowISO();
                          });
                        }}
                        placeholder="Success criteria"
                      />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 min-w-[70px] text-center">{streak}d streak</span>
                    <button
                      className="btn-danger px-3 py-1.5"
                      onClick={() => {
                        if (!window.confirm('Delete this non-negotiable?')) return;
                        updateData((draft) => {
                          draft.dashboard.nonNegotiables = draft.dashboard.nonNegotiables.filter((entry) => entry.id !== item.id);
                        });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1.2fr_auto]">
            <input
              className="input-field"
              placeholder="Add new non-negotiable"
              value={nonNegotiableDraft.title}
              onChange={(event) => setNonNegotiableDraft((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Success criteria / output"
              value={nonNegotiableDraft.description}
              onChange={(event) => setNonNegotiableDraft((prev) => ({ ...prev, description: event.target.value }))}
            />
            <button
              className="btn-primary"
              onClick={() => {
                const title = nonNegotiableDraft.title.trim();
                if (!title) return;
                updateData((draft) => {
                  if (!Array.isArray(draft.dashboard.nonNegotiables)) draft.dashboard.nonNegotiables = [];
                  draft.dashboard.nonNegotiables.push({
                    id: uid('nn'),
                    title,
                    description: nonNegotiableDraft.description.trim(),
                    completionDates: [],
                    createdAt: nowISO(),
                    updatedAt: nowISO()
                  });
                });
                setNonNegotiableDraft({ title: '', description: '' });
              }}
            >
              Add
            </button>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
              <span>Today&apos;s non-negotiable completion</span>
              <span>{nonNegotiableProgress}%</span>
            </div>
            <ProgressBar progress={nonNegotiableProgress} />
          </div>
        </article>

        <article className="card-panel p-4 space-y-2">
          <h3 className="font-heading text-lg font-semibold">How It Works</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Completion is tracked by date, so each task becomes available again every new day.</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Default items are based on your two uploaded playbooks and war-mode system.</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Add your own non-negotiables and keep only what drives execution.</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="card-panel p-4 lg:col-span-2">
          <h3 className="font-heading text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button className="btn-primary" onClick={() => setActiveView('metrics')}>Update Metrics</button>
            <button className="btn-secondary" onClick={() => setActiveView('decisions')}>Log Decision</button>
            <button className="btn-secondary" onClick={() => setActiveView('knowledge')}>Add Journal</button>
            <button className="btn-secondary" onClick={() => setActiveView('rhythm')}>Weekly Review</button>
          </div>
        </article>

        <article className="card-panel p-4">
          <h3 className="font-heading text-lg font-semibold mb-3">Reports</h3>
          <div className="space-y-2">
            <button className="btn-secondary w-full" onClick={() => onGenerateReport('weekly')}>Generate Weekly Report</button>
            <button className="btn-secondary w-full" onClick={() => onGenerateReport('monthly')}>Generate Monthly Report</button>
          </div>
          <div className="mt-3 max-h-48 overflow-auto pr-1 space-y-2">
            {data.reports.slice(0, 4).map((report) => (
              <div key={report.id} className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2 text-xs">
                <p className="font-semibold uppercase tracking-wide">{report.type} report</p>
                <p className="text-slate-500 dark:text-slate-400">Period: {report.period}</p>
                <p className="text-slate-500 dark:text-slate-400">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function ExecutionView({ data, currentMonth, updateData }) {
  const [criterionInput, setCriterionInput] = useState({});
  const [activityInput, setActivityInput] = useState({});

  return (
    <div className="space-y-4 animate-slideFade">
      {data.execution.months.map((month) => (
        <details key={month.id} open={month.month === currentMonth} className="card-panel p-0 overflow-hidden">
          <summary className="list-none cursor-pointer p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Month {month.month}</p>
              <h3 className="font-heading text-lg font-semibold">{month.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={month.status} />
              <span className="text-sm text-slate-500 dark:text-slate-400">{month.progress}%</span>
            </div>
          </summary>
          <div className="px-4 pb-4 space-y-4">
            <ProgressBar progress={month.progress} />
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</label>
                <select
                  value={month.status}
                  className="input-field mt-1"
                  onChange={(event) => {
                    const status = event.target.value;
                    updateData((draft) => {
                      const target = draft.execution.months.find((item) => item.id === month.id);
                      if (!target) return;
                      target.status = status;
                      if (status === 'Complete') {
                        target.exitCriteria.forEach((item) => {
                          item.done = true;
                          item.updatedAt = nowISO();
                        });
                        target.activities.forEach((item) => {
                          item.done = true;
                          item.updatedAt = nowISO();
                        });
                      }
                      if (status === 'Not Started') {
                        target.exitCriteria.forEach((item) => {
                          item.done = false;
                          item.updatedAt = nowISO();
                        });
                        target.activities.forEach((item) => {
                          item.done = false;
                          item.updatedAt = nowISO();
                        });
                      }
                      refreshMonthProgress(target);
                    });
                  }}
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Complete</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Exit Criteria Checklist</h4>
                {month.exitCriteria.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        updateData((draft) => {
                          const targetMonth = draft.execution.months.find((entry) => entry.id === month.id);
                          if (!targetMonth) return;
                          const targetItem = targetMonth.exitCriteria.find((entry) => entry.id === item.id);
                          if (!targetItem) return;
                          targetItem.done = checked;
                          targetItem.updatedAt = nowISO();
                          refreshMonthProgress(targetMonth);
                        });
                      }}
                      className="h-4 w-4 rounded"
                    />
                    <span className="flex-1 text-sm">{item.text}</span>
                    <button
                      className="text-xs text-rose-500 hover:text-rose-600"
                      onClick={() => {
                        if (!window.confirm('Delete this exit criterion?')) return;
                        updateData((draft) => {
                          const targetMonth = draft.execution.months.find((entry) => entry.id === month.id);
                          if (!targetMonth) return;
                          targetMonth.exitCriteria = targetMonth.exitCriteria.filter((entry) => entry.id !== item.id);
                          refreshMonthProgress(targetMonth);
                        });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    className="input-field"
                    placeholder="Add criterion"
                    value={criterionInput[month.id] || ''}
                    onChange={(event) => setCriterionInput((prev) => ({ ...prev, [month.id]: event.target.value }))}
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const text = (criterionInput[month.id] || '').trim();
                      if (!text) return;
                      updateData((draft) => {
                        const targetMonth = draft.execution.months.find((entry) => entry.id === month.id);
                        if (!targetMonth) return;
                        targetMonth.exitCriteria.push({
                          id: uid('exit'),
                          text,
                          done: false,
                          createdAt: nowISO(),
                          updatedAt: nowISO()
                        });
                        refreshMonthProgress(targetMonth);
                      });
                      setCriterionInput((prev) => ({ ...prev, [month.id]: '' }));
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Key Activities</h4>
                {month.activities.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        updateData((draft) => {
                          const targetMonth = draft.execution.months.find((entry) => entry.id === month.id);
                          if (!targetMonth) return;
                          const targetItem = targetMonth.activities.find((entry) => entry.id === item.id);
                          if (!targetItem) return;
                          targetItem.done = checked;
                          targetItem.updatedAt = nowISO();
                          refreshMonthProgress(targetMonth);
                        });
                      }}
                      className="h-4 w-4 rounded"
                    />
                    <span className="flex-1 text-sm">{item.text}</span>
                    <button
                      className="text-xs text-rose-500 hover:text-rose-600"
                      onClick={() => {
                        if (!window.confirm('Delete this activity?')) return;
                        updateData((draft) => {
                          const targetMonth = draft.execution.months.find((entry) => entry.id === month.id);
                          if (!targetMonth) return;
                          targetMonth.activities = targetMonth.activities.filter((entry) => entry.id !== item.id);
                          refreshMonthProgress(targetMonth);
                        });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    className="input-field"
                    placeholder="Add activity"
                    value={activityInput[month.id] || ''}
                    onChange={(event) => setActivityInput((prev) => ({ ...prev, [month.id]: event.target.value }))}
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const text = (activityInput[month.id] || '').trim();
                      if (!text) return;
                      updateData((draft) => {
                        const targetMonth = draft.execution.months.find((entry) => entry.id === month.id);
                        if (!targetMonth) return;
                        targetMonth.activities.push({
                          id: uid('activity'),
                          text,
                          done: false,
                          createdAt: nowISO(),
                          updatedAt: nowISO()
                        });
                        refreshMonthProgress(targetMonth);
                      });
                      setActivityInput((prev) => ({ ...prev, [month.id]: '' }));
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function LearningView({ data, updateData }) {
  const [modelSearch, setModelSearch] = useState('');
  const [courseModal, setCourseModal] = useState(null);
  const [hoursForm, setHoursForm] = useState({ weekStart: toWeekStartISO(), hours: 0 });

  const filteredModels = useMemo(
    () => MENTAL_MODELS.filter((model) => `${model.name} ${model.description}`.toLowerCase().includes(modelSearch.toLowerCase())),
    [modelSearch]
  );

  const booksProgress = data.learning.booksGoal > 0
    ? Math.round((num(data.learning.booksRead) / num(data.learning.booksGoal)) * 100)
    : 0;

  const learningStreak = (() => {
    const weekSet = new Set(
      data.learning.learningHours
        .filter((entry) => num(entry.hours) > 0)
        .map((entry) => entry.weekStart)
    );
    let streak = 0;
    let cursor = new Date(`${toWeekStartISO()}T00:00:00`);
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (!weekSet.has(key)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    }
    return streak;
  })();

  return (
    <div className="space-y-6 animate-slideFade">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Books Read" value={data.learning.booksRead} subtitle={`Goal ${data.learning.booksGoal}+`} tone={booksProgress >= 70 ? 'good' : booksProgress >= 35 ? 'warn' : 'bad'} />
        <MetricCard title="Models Mastered" value={data.learning.mentalModelsMastered.length} subtitle={`of ${MENTAL_MODELS.length} models`} tone={data.learning.mentalModelsMastered.length >= 25 ? 'good' : 'warn'} />
        <MetricCard title="Domain Expertise" value={`${data.learning.domainExpertise}/10`} subtitle="Self-assessed level" tone={data.learning.domainExpertise >= 7 ? 'good' : 'warn'} />
        <MetricCard title="AI Hours Saved" value={round(data.learning.aiHoursSaved, 1)} subtitle="Cumulative" tone={data.learning.aiHoursSaved >= 25 ? 'good' : 'default'} />
      </section>

      <section className="card-panel p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h3 className="font-heading text-lg font-semibold">Reading and Learning Velocity</h3>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={() => updateData((draft) => { draft.learning.booksRead = Math.max(0, num(draft.learning.booksRead) - 1); })}>-1 Book</button>
            <button className="btn-primary" onClick={() => updateData((draft) => { draft.learning.booksRead = num(draft.learning.booksRead) + 1; })}>+1 Book</button>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
            <span>Books progress</span>
            <span>{booksProgress}%</span>
          </div>
          <ProgressBar progress={booksProgress} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Domain Expertise Level ({data.learning.domainExpertise})</label>
            <input
              type="range"
              min="1"
              max="10"
              value={data.learning.domainExpertise}
              onChange={(event) => {
                const level = clamp(num(event.target.value), 1, 10);
                updateData((draft) => {
                  draft.learning.domainExpertise = level;
                });
              }}
              className="w-full mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">AI Hours Saved</label>
            <input
              type="number"
              min="0"
              step="0.5"
              className="input-field mt-1"
              value={data.learning.aiHoursSaved}
              onChange={(event) => {
                const value = Math.max(0, num(event.target.value));
                updateData((draft) => {
                  draft.learning.aiHoursSaved = value;
                });
              }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">Learning Hours Logged</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">{learningStreak} week streak</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="date"
              className="input-field"
              value={hoursForm.weekStart}
              onChange={(event) => setHoursForm((prev) => ({ ...prev, weekStart: event.target.value }))}
            />
            <input
              type="number"
              min="0"
              step="0.5"
              className="input-field"
              value={hoursForm.hours}
              onChange={(event) => setHoursForm((prev) => ({ ...prev, hours: event.target.value }))}
            />
            <button
              className="btn-primary"
              onClick={() => {
                const weekStart = toWeekStartFromISO(hoursForm.weekStart);
                const hours = Math.max(0, num(hoursForm.hours));
                updateData((draft) => {
                  const existing = draft.learning.learningHours.find((entry) => entry.weekStart === weekStart);
                  if (existing) {
                    existing.hours = hours;
                    existing.updatedAt = nowISO();
                  } else {
                    draft.learning.learningHours.push({
                      id: uid('hours'),
                      weekStart,
                      hours,
                      createdAt: nowISO(),
                      updatedAt: nowISO()
                    });
                  }
                });
                setHoursForm({ weekStart: toWeekStartISO(), hours: 0 });
              }}
            >
              Save
            </button>
          </div>

          <div className="max-h-56 overflow-auto space-y-2 pr-1">
            {data.learning.learningHours.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                <div>
                  <p className="text-sm font-medium">Week of {entry.weekStart}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{entry.hours} hours</p>
                </div>
                <button
                  className="btn-danger px-3 py-1.5"
                  onClick={() => {
                    if (!window.confirm('Delete this learning log?')) return;
                    updateData((draft) => {
                      draft.learning.learningHours = draft.learning.learningHours.filter((item) => item.id !== entry.id);
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="card-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold">Courses and Resources</h3>
            <button
              className="btn-secondary"
              onClick={() => setCourseModal({
                id: null,
                title: '',
                resourceType: 'Course',
                completed: false,
                notes: ''
              })}
            >
              Add Course
            </button>
          </div>
          <div className="max-h-64 overflow-auto space-y-2 pr-1">
            {data.learning.courses.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No courses logged yet.</p> : null}
            {data.learning.courses.map((course) => (
              <div key={course.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{course.resourceType}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${course.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'}`}>
                    {course.completed ? 'Complete' : 'In Progress'}
                  </span>
                </div>
                {course.notes ? <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{course.notes}</p> : null}
                <div className="mt-2 flex gap-2">
                  <button className="btn-secondary px-3 py-1.5" onClick={() => setCourseModal(course)}>Edit</button>
                  <button
                    className="btn-danger px-3 py-1.5"
                    onClick={() => {
                      if (!window.confirm('Delete this course/resource?')) return;
                      updateData((draft) => {
                        draft.learning.courses = draft.learning.courses.filter((item) => item.id !== course.id);
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card-panel p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="font-heading text-lg font-semibold">Mental Models Mastery</h3>
          <input
            className="input-field max-w-sm"
            placeholder="Search model name or description"
            value={modelSearch}
            onChange={(event) => setModelSearch(event.target.value)}
          />
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3 max-h-[28rem] overflow-auto pr-1">
          {filteredModels.map((model) => {
            const mastered = data.learning.mentalModelsMastered.includes(model.id);
            return (
              <label
                key={model.id}
                className={`rounded-lg border p-3 cursor-pointer transition ${mastered ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40'}`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={mastered}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      updateData((draft) => {
                        const set = new Set(draft.learning.mentalModelsMastered);
                        if (checked) set.add(model.id);
                        else set.delete(model.id);
                        draft.learning.mentalModelsMastered = [...set];
                      });
                    }}
                    className="h-4 w-4 mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">{model.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{model.description}</p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {courseModal ? (
        <Modal title={courseModal.id ? 'Edit Course / Resource' : 'Add Course / Resource'} onClose={() => setCourseModal(null)} maxWidth="max-w-xl">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!courseModal.title.trim()) return;
              updateData((draft) => {
                if (courseModal.id) {
                  const target = draft.learning.courses.find((item) => item.id === courseModal.id);
                  if (!target) return;
                  target.title = courseModal.title.trim();
                  target.resourceType = courseModal.resourceType;
                  target.completed = courseModal.completed;
                  target.notes = courseModal.notes.trim();
                  target.updatedAt = nowISO();
                } else {
                  draft.learning.courses.unshift({
                    id: uid('course'),
                    title: courseModal.title.trim(),
                    resourceType: courseModal.resourceType,
                    completed: courseModal.completed,
                    notes: courseModal.notes.trim(),
                    createdAt: nowISO(),
                    updatedAt: nowISO()
                  });
                }
              });
              setCourseModal(null);
            }}
          >
            <div>
              <label className="label">Title</label>
              <input className="input-field" value={courseModal.title} onChange={(event) => setCourseModal((prev) => ({ ...prev, title: event.target.value }))} required />
            </div>
            <div>
              <label className="label">Resource Type</label>
              <select className="input-field" value={courseModal.resourceType} onChange={(event) => setCourseModal((prev) => ({ ...prev, resourceType: event.target.value }))}>
                <option>Course</option>
                <option>Book</option>
                <option>Podcast</option>
                <option>Article</option>
                <option>Workshop</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={courseModal.completed} onChange={(event) => setCourseModal((prev) => ({ ...prev, completed: event.target.checked }))} />
              Completed
            </label>
            <div>
              <label className="label">Notes</label>
              <textarea className="input-field min-h-24" value={courseModal.notes} onChange={(event) => setCourseModal((prev) => ({ ...prev, notes: event.target.value }))} />
            </div>
            <button className="btn-primary" type="submit">Save</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function DecisionModal({ value, onChange, onClose, onSave }) {
  const modelLookup = useMemo(() => MENTAL_MODELS.map((item) => item.name), []);

  return (
    <Modal title={value.id ? 'Edit Decision' : 'Add Decision'} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.statement.trim()) return;
          onSave();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input-field" value={value.date} onChange={(event) => onChange({ ...value, date: event.target.value })} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value })}>
              {DECISION_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Decision Statement</label>
          <input className="input-field" value={value.statement} onChange={(event) => onChange({ ...value, statement: event.target.value })} required />
        </div>
        <div>
          <label className="label">Options Considered</label>
          <textarea className="input-field min-h-20" value={value.optionsConsidered} onChange={(event) => onChange({ ...value, optionsConsidered: event.target.value })} />
        </div>
        <div>
          <label className="label">Chosen Option and Reasoning</label>
          <textarea className="input-field min-h-20" value={value.chosenOption} onChange={(event) => onChange({ ...value, chosenOption: event.target.value })} />
        </div>
        <div>
          <label className="label">Reasoning</label>
          <textarea className="input-field min-h-20" value={value.reasoning} onChange={(event) => onChange({ ...value, reasoning: event.target.value })} />
        </div>
        <div>
          <label className="label">Expected Outcomes</label>
          <textarea className="input-field min-h-20" value={value.expectedOutcomes} onChange={(event) => onChange({ ...value, expectedOutcomes: event.target.value })} />
        </div>
        <div>
          <label className="label">Reversal Criteria</label>
          <textarea className="input-field min-h-20" value={value.reversalCriteria} onChange={(event) => onChange({ ...value, reversalCriteria: event.target.value })} />
        </div>
        <div>
          <label className="label">Mental Models Used (comma-separated)</label>
          <input
            className="input-field"
            placeholder="First Principles, Inversion, Expected Value"
            value={value.mentalModelsInput}
            onChange={(event) => onChange({ ...value, mentalModelsInput: event.target.value })}
            list="mental-model-names"
          />
          <datalist id="mental-model-names">
            {modelLookup.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>
        <button className="btn-primary" type="submit">Save Decision</button>
      </form>
    </Modal>
  );
}

function DecisionsView({ data, updateData }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [form, setForm] = useState(null);

  const filtered = useMemo(() => {
    return data.decisions.filter((decision) => {
      const haystack = `${decision.statement} ${decision.reasoning} ${decision.expectedOutcomes} ${decision.reversalCriteria}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.toLowerCase());
      const matchesCategory = category === 'All' || decision.category === category;
      const matchesFrom = !fromDate || decision.date >= fromDate;
      const matchesTo = !toDate || decision.date <= toDate;
      return matchesSearch && matchesCategory && matchesFrom && matchesTo;
    });
  }, [data.decisions, search, category, fromDate, toDate]);

  return (
    <div className="space-y-4 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="label">Search</label>
            <input className="input-field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search statements, outcomes, reasoning" />
          </div>
          <div className="min-w-[160px]">
            <label className="label">Category</label>
            <select className="input-field" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>All</option>
              {DECISION_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className="label">From</label>
            <input type="date" className="input-field" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input-field" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <button
            className="btn-primary"
            onClick={() => setForm({
              id: null,
              date: toDateISO(),
              category: 'Operations',
              statement: '',
              optionsConsidered: '',
              chosenOption: '',
              reasoning: '',
              expectedOutcomes: '',
              reversalCriteria: '',
              mentalModelsInput: ''
            })}
          >
            Add Decision
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card-panel p-4 text-sm text-slate-500 dark:text-slate-400">No decisions match the current filters.</div>
        ) : null}
        {filtered.map((decision) => (
          <article key={decision.id} className="card-panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-semibold">{decision.statement || 'Untitled decision'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{decision.date} • {decision.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary px-3 py-1.5"
                  onClick={() => setForm({
                    id: decision.id,
                    date: decision.date,
                    category: decision.category,
                    statement: decision.statement,
                    optionsConsidered: decision.optionsConsidered,
                    chosenOption: decision.chosenOption,
                    reasoning: decision.reasoning,
                    expectedOutcomes: decision.expectedOutcomes,
                    reversalCriteria: decision.reversalCriteria,
                    mentalModelsInput: decision.mentalModelsUsed.join(', ')
                  })}
                >
                  Edit
                </button>
                <button
                  className="btn-danger px-3 py-1.5"
                  onClick={() => {
                    if (!window.confirm('Delete this decision?')) return;
                    updateData((draft) => {
                      draft.decisions = draft.decisions.filter((entry) => entry.id !== decision.id);
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2 mt-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Options Considered</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{decision.optionsConsidered || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Chosen Option</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{decision.chosenOption || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Reasoning</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{decision.reasoning || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Expected Outcomes</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{decision.expectedOutcomes || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Reversal Criteria</p>
                <p className="mt-1 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{decision.reversalCriteria || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Mental Models Used</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {decision.mentalModelsUsed.length ? decision.mentalModelsUsed.map((model) => (
                    <span key={model} className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                      {model}
                    </span>
                  )) : <span className="text-slate-500 dark:text-slate-400">—</span>}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {form ? (
        <DecisionModal
          value={form}
          onChange={setForm}
          onClose={() => setForm(null)}
          onSave={() => {
            const models = form.mentalModelsInput
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);
            updateData((draft) => {
              if (form.id) {
                const target = draft.decisions.find((entry) => entry.id === form.id);
                if (!target) return;
                target.date = form.date;
                target.category = form.category;
                target.statement = form.statement.trim();
                target.optionsConsidered = form.optionsConsidered.trim();
                target.chosenOption = form.chosenOption.trim();
                target.reasoning = form.reasoning.trim();
                target.expectedOutcomes = form.expectedOutcomes.trim();
                target.reversalCriteria = form.reversalCriteria.trim();
                target.mentalModelsUsed = models;
                target.updatedAt = nowISO();
              } else {
                draft.decisions.unshift({
                  id: uid('decision'),
                  date: form.date,
                  category: form.category,
                  statement: form.statement.trim(),
                  optionsConsidered: form.optionsConsidered.trim(),
                  chosenOption: form.chosenOption.trim(),
                  reasoning: form.reasoning.trim(),
                  expectedOutcomes: form.expectedOutcomes.trim(),
                  reversalCriteria: form.reversalCriteria.trim(),
                  mentalModelsUsed: models,
                  createdAt: nowISO(),
                  updatedAt: nowISO()
                });
              }
            });
            setForm(null);
          }}
        />
      ) : null}
    </div>
  );
}

function KnowledgeModal({ type, value, onChange, onClose, onSave }) {
  const titleByType = {
    journal: value.id ? 'Edit Journal Entry' : 'Add Journal Entry',
    review: value.id ? 'Edit Weekly Review' : 'Add Weekly Review',
    playbook: value.id ? 'Edit Playbook' : 'Add Playbook',
    interview: value.id ? 'Edit Customer Interview' : 'Add Customer Interview'
  };

  return (
    <Modal title={titleByType[type]} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        {type === 'journal' ? (
          <>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input-field" value={value.date} onChange={(event) => onChange({ ...value, date: event.target.value })} required />
            </div>
            <div>
              <label className="label">What Worked</label>
              <textarea className="input-field min-h-20" value={value.worked} onChange={(event) => onChange({ ...value, worked: event.target.value })} required />
            </div>
            <div>
              <label className="label">What Did Not Work</label>
              <textarea className="input-field min-h-20" value={value.didntWork} onChange={(event) => onChange({ ...value, didntWork: event.target.value })} />
            </div>
            <div>
              <label className="label">Learnings</label>
              <textarea className="input-field min-h-20" value={value.learnings} onChange={(event) => onChange({ ...value, learnings: event.target.value })} />
            </div>
          </>
        ) : null}

        {type === 'review' ? (
          <>
            <div>
              <label className="label">Week Start</label>
              <input type="date" className="input-field" value={value.weekStart} onChange={(event) => onChange({ ...value, weekStart: toWeekStartFromISO(event.target.value) })} required />
            </div>
            <div>
              <label className="label">Summary</label>
              <textarea className="input-field min-h-20" value={value.summary} onChange={(event) => onChange({ ...value, summary: event.target.value })} required />
            </div>
            <div>
              <label className="label">Wins</label>
              <textarea className="input-field min-h-20" value={value.wins} onChange={(event) => onChange({ ...value, wins: event.target.value })} />
            </div>
            <div>
              <label className="label">Misses</label>
              <textarea className="input-field min-h-20" value={value.misses} onChange={(event) => onChange({ ...value, misses: event.target.value })} />
            </div>
            <div>
              <label className="label">Next Focus</label>
              <textarea className="input-field min-h-20" value={value.nextFocus} onChange={(event) => onChange({ ...value, nextFocus: event.target.value })} />
            </div>
          </>
        ) : null}

        {type === 'playbook' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value })}>
                  {PLAYBOOK_TYPES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input-field" value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Content</label>
              <textarea className="input-field min-h-32" value={value.content} onChange={(event) => onChange({ ...value, content: event.target.value })} required />
            </div>
          </>
        ) : null}

        {type === 'interview' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Date</label>
                <input type="date" className="input-field" value={value.date} onChange={(event) => onChange({ ...value, date: event.target.value })} required />
              </div>
              <div>
                <label className="label">Customer</label>
                <input className="input-field" value={value.customer} onChange={(event) => onChange({ ...value, customer: event.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Interview Notes</label>
              <textarea className="input-field min-h-20" value={value.notes} onChange={(event) => onChange({ ...value, notes: event.target.value })} />
            </div>
            <div>
              <label className="label">Insights</label>
              <textarea className="input-field min-h-20" value={value.insights} onChange={(event) => onChange({ ...value, insights: event.target.value })} />
            </div>
            <div>
              <label className="label">Next Steps</label>
              <textarea className="input-field min-h-20" value={value.nextSteps} onChange={(event) => onChange({ ...value, nextSteps: event.target.value })} />
            </div>
          </>
        ) : null}

        <button type="submit" className="btn-primary">Save</button>
      </form>
    </Modal>
  );
}

function KnowledgeView({ data, updateData }) {
  const [tab, setTab] = useState('journal');
  const [modal, setModal] = useState(null);

  const tabButton = (key, label) => (
    <button
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${tab === key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
      onClick={() => setTab(key)}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex flex-wrap gap-2">
          {tabButton('journal', 'Daily Journal')}
          {tabButton('weekly', 'Weekly Reviews')}
          {tabButton('models', 'Mental Models Library')}
          {tabButton('playbooks', 'Playbooks')}
          {tabButton('interviews', 'Customer Interviews')}
        </div>
      </section>

      {tab === 'journal' ? (
        <section className="space-y-3">
          <button
            className="btn-primary"
            onClick={() => setModal({
              type: 'journal',
              value: { id: null, date: toDateISO(), worked: '', didntWork: '', learnings: '' }
            })}
          >
            Add Journal Entry
          </button>
          {data.knowledge.journals.length === 0 ? <div className="card-panel p-4 text-sm text-slate-500 dark:text-slate-400">No journal entries yet.</div> : null}
          {data.knowledge.journals.map((entry) => (
            <article key={entry.id} className="card-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-semibold">{entry.date}</h3>
                <div className="flex gap-2">
                  <button className="btn-secondary px-3 py-1.5" onClick={() => setModal({ type: 'journal', value: entry })}>Edit</button>
                  <button
                    className="btn-danger px-3 py-1.5"
                    onClick={() => {
                      if (!window.confirm('Delete this journal entry?')) return;
                      updateData((draft) => {
                        draft.knowledge.journals = draft.knowledge.journals.filter((item) => item.id !== entry.id);
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-3 mt-3 text-sm">
                <div><p className="text-xs uppercase tracking-wide text-slate-500">What Worked</p><p className="mt-1 whitespace-pre-wrap">{entry.worked || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">What Didn't</p><p className="mt-1 whitespace-pre-wrap">{entry.didntWork || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Learned</p><p className="mt-1 whitespace-pre-wrap">{entry.learnings || '—'}</p></div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'weekly' ? (
        <section className="space-y-3">
          <button
            className="btn-primary"
            onClick={() => setModal({
              type: 'review',
              value: { id: null, weekStart: toWeekStartISO(), summary: '', wins: '', misses: '', nextFocus: '' }
            })}
          >
            Add Weekly Review
          </button>
          {data.knowledge.weeklyReviews.length === 0 ? <div className="card-panel p-4 text-sm text-slate-500 dark:text-slate-400">No weekly reviews yet.</div> : null}
          {data.knowledge.weeklyReviews.map((entry) => (
            <article key={entry.id} className="card-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading font-semibold">Week of {entry.weekStart}</h3>
                <div className="flex gap-2">
                  <button className="btn-secondary px-3 py-1.5" onClick={() => setModal({ type: 'review', value: entry })}>Edit</button>
                  <button
                    className="btn-danger px-3 py-1.5"
                    onClick={() => {
                      if (!window.confirm('Delete this weekly review?')) return;
                      updateData((draft) => {
                        draft.knowledge.weeklyReviews = draft.knowledge.weeklyReviews.filter((item) => item.id !== entry.id);
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2 mt-3 text-sm">
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Summary</p><p className="mt-1 whitespace-pre-wrap">{entry.summary || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Wins</p><p className="mt-1 whitespace-pre-wrap">{entry.wins || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Misses</p><p className="mt-1 whitespace-pre-wrap">{entry.misses || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Next Focus</p><p className="mt-1 whitespace-pre-wrap">{entry.nextFocus || '—'}</p></div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'models' ? (
        <section className="card-panel p-4">
          <h3 className="font-heading text-lg font-semibold mb-3">All 50 Mental Models</h3>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3 max-h-[34rem] overflow-auto pr-1">
            {MENTAL_MODELS.map((model) => {
              const mastered = data.learning.mentalModelsMastered.includes(model.id);
              return (
                <div key={model.id} className={`rounded-lg border p-3 ${mastered ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{model.name}</p>
                    <button
                      className={`text-xs px-2 py-1 rounded-full ${mastered ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                      onClick={() => {
                        updateData((draft) => {
                          const set = new Set(draft.learning.mentalModelsMastered);
                          if (set.has(model.id)) set.delete(model.id);
                          else set.add(model.id);
                          draft.learning.mentalModelsMastered = [...set];
                        });
                      }}
                    >
                      {mastered ? 'Mastered' : 'Mark Mastered'}
                    </button>
                  </div>
                  <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">{model.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {tab === 'playbooks' ? (
        <section className="space-y-3">
          <button
            className="btn-primary"
            onClick={() => setModal({ type: 'playbook', value: { id: null, type: 'Product', title: '', content: '' } })}
          >
            Add Playbook
          </button>
          {data.knowledge.playbooks.map((playbook) => (
            <article key={playbook.id} className="card-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{playbook.type}</p>
                  <h3 className="font-heading font-semibold">{playbook.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary px-3 py-1.5" onClick={() => setModal({ type: 'playbook', value: playbook })}>Edit</button>
                  <button
                    className="btn-danger px-3 py-1.5"
                    onClick={() => {
                      if (!window.confirm('Delete this playbook?')) return;
                      updateData((draft) => {
                        draft.knowledge.playbooks = draft.knowledge.playbooks.filter((item) => item.id !== playbook.id);
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{playbook.content || 'No content yet.'}</p>
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'interviews' ? (
        <section className="space-y-3">
          <button
            className="btn-primary"
            onClick={() => setModal({
              type: 'interview',
              value: { id: null, date: toDateISO(), customer: '', notes: '', insights: '', nextSteps: '' }
            })}
          >
            Add Interview Note
          </button>
          {data.knowledge.customerInterviews.length === 0 ? <div className="card-panel p-4 text-sm text-slate-500 dark:text-slate-400">No interview notes yet.</div> : null}
          {data.knowledge.customerInterviews.map((entry) => (
            <article key={entry.id} className="card-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading font-semibold">{entry.customer}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{entry.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary px-3 py-1.5" onClick={() => setModal({ type: 'interview', value: entry })}>Edit</button>
                  <button
                    className="btn-danger px-3 py-1.5"
                    onClick={() => {
                      if (!window.confirm('Delete this interview note?')) return;
                      updateData((draft) => {
                        draft.knowledge.customerInterviews = draft.knowledge.customerInterviews.filter((item) => item.id !== entry.id);
                      });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-3 mt-2 text-sm">
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Notes</p><p className="mt-1 whitespace-pre-wrap">{entry.notes || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Insights</p><p className="mt-1 whitespace-pre-wrap">{entry.insights || '—'}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Next Steps</p><p className="mt-1 whitespace-pre-wrap">{entry.nextSteps || '—'}</p></div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {modal ? (
        <KnowledgeModal
          type={modal.type}
          value={modal.value}
          onChange={(value) => setModal((prev) => ({ ...prev, value }))}
          onClose={() => setModal(null)}
          onSave={() => {
            const { type, value } = modal;
            updateData((draft) => {
              if (type === 'journal') {
                if (!value.worked.trim()) return;
                if (value.id) {
                  const target = draft.knowledge.journals.find((item) => item.id === value.id);
                  if (!target) return;
                  target.date = value.date;
                  target.worked = value.worked.trim();
                  target.didntWork = value.didntWork.trim();
                  target.learnings = value.learnings.trim();
                  target.updatedAt = nowISO();
                } else {
                  draft.knowledge.journals.unshift({
                    id: uid('journal'),
                    date: value.date,
                    worked: value.worked.trim(),
                    didntWork: value.didntWork.trim(),
                    learnings: value.learnings.trim(),
                    createdAt: nowISO(),
                    updatedAt: nowISO()
                  });
                }
              }

              if (type === 'review') {
                if (!value.summary.trim()) return;
                if (value.id) {
                  const target = draft.knowledge.weeklyReviews.find((item) => item.id === value.id);
                  if (!target) return;
                  target.weekStart = value.weekStart;
                  target.summary = value.summary.trim();
                  target.wins = value.wins.trim();
                  target.misses = value.misses.trim();
                  target.nextFocus = value.nextFocus.trim();
                  target.updatedAt = nowISO();
                } else {
                  draft.knowledge.weeklyReviews.unshift({
                    id: uid('review'),
                    weekStart: value.weekStart,
                    summary: value.summary.trim(),
                    wins: value.wins.trim(),
                    misses: value.misses.trim(),
                    nextFocus: value.nextFocus.trim(),
                    createdAt: nowISO(),
                    updatedAt: nowISO()
                  });
                }
              }

              if (type === 'playbook') {
                if (!value.title.trim()) return;
                if (value.id) {
                  const target = draft.knowledge.playbooks.find((item) => item.id === value.id);
                  if (!target) return;
                  target.type = value.type;
                  target.title = value.title.trim();
                  target.content = value.content.trim();
                  target.updatedAt = nowISO();
                } else {
                  draft.knowledge.playbooks.unshift({
                    id: uid('playbook'),
                    type: value.type,
                    title: value.title.trim(),
                    content: value.content.trim(),
                    createdAt: nowISO(),
                    updatedAt: nowISO()
                  });
                }
              }

              if (type === 'interview') {
                if (!value.customer.trim()) return;
                if (value.id) {
                  const target = draft.knowledge.customerInterviews.find((item) => item.id === value.id);
                  if (!target) return;
                  target.date = value.date;
                  target.customer = value.customer.trim();
                  target.notes = value.notes.trim();
                  target.insights = value.insights.trim();
                  target.nextSteps = value.nextSteps.trim();
                  target.updatedAt = nowISO();
                } else {
                  draft.knowledge.customerInterviews.unshift({
                    id: uid('interview'),
                    date: value.date,
                    customer: value.customer.trim(),
                    notes: value.notes.trim(),
                    insights: value.insights.trim(),
                    nextSteps: value.nextSteps.trim(),
                    createdAt: nowISO(),
                    updatedAt: nowISO()
                  });
                }
              }
            });
            setModal(null);
          }}
        />
      ) : null}
    </div>
  );
}

function MetricSnapshotModal({ value, onChange, onClose, onSave }) {
  const runway = num(value.burnRate) > 0 ? round(num(value.cashInBank) / num(value.burnRate), 1) : 0;

  return (
    <Modal title={value.id ? 'Edit Metric Snapshot' : 'Add Metric Snapshot'} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input-field" value={value.date} onChange={(event) => onChange({ ...value, date: event.target.value })} required />
          </div>
          <div>
            <label className="label">MRR</label>
            <input type="number" min="0" className="input-field" value={value.mrr} onChange={(event) => onChange({ ...value, mrr: event.target.value })} required />
          </div>
          <div>
            <label className="label">Customers</label>
            <input type="number" min="0" className="input-field" value={value.customers} onChange={(event) => onChange({ ...value, customers: event.target.value })} />
          </div>
          <div>
            <label className="label">WAU</label>
            <input type="number" min="0" className="input-field" value={value.wau} onChange={(event) => onChange({ ...value, wau: event.target.value })} />
          </div>
          <div>
            <label className="label">MoM Growth %</label>
            <input type="number" className="input-field" value={value.momGrowth} onChange={(event) => onChange({ ...value, momGrowth: event.target.value })} />
          </div>
          <div>
            <label className="label">Conversations (week)</label>
            <input type="number" min="0" className="input-field" value={value.conversations} onChange={(event) => onChange({ ...value, conversations: event.target.value })} />
          </div>
          <div>
            <label className="label">Burn Rate / month</label>
            <input type="number" min="0" className="input-field" value={value.burnRate} onChange={(event) => onChange({ ...value, burnRate: event.target.value })} />
          </div>
          <div>
            <label className="label">Cash In Bank</label>
            <input type="number" min="0" className="input-field" value={value.cashInBank} onChange={(event) => onChange({ ...value, cashInBank: event.target.value })} />
          </div>
          <div>
            <label className="label">Runway (auto)</label>
            <input className="input-field bg-slate-100 dark:bg-slate-800" value={`${runway} months`} disabled />
          </div>
        </div>
        <button type="submit" className="btn-primary">Save Snapshot</button>
      </form>
    </Modal>
  );
}

function CohortModal({ value, onChange, onClose, onSave }) {
  return (
    <Modal title={value.id ? 'Edit Cohort' : 'Add Cohort'} onClose={onClose} maxWidth="max-w-2xl">
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Name</label>
            <input className="input-field" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} required />
          </div>
          <div>
            <label className="label">Start Month</label>
            <input type="month" className="input-field" value={value.startMonth} onChange={(event) => onChange({ ...value, startMonth: event.target.value })} required />
          </div>
          <div>
            <label className="label">Users</label>
            <input type="number" min="0" className="input-field" value={value.users} onChange={(event) => onChange({ ...value, users: event.target.value })} required />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {value.retention.map((item, index) => (
            <div key={`ret_${index}`}>
              <label className="label">Month {index}</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input-field"
                value={item}
                onChange={(event) => {
                  const copy = [...value.retention];
                  copy[index] = event.target.value;
                  onChange({ ...value, retention: copy });
                }}
              />
            </div>
          ))}
        </div>
        <button className="btn-primary" type="submit">Save Cohort</button>
      </form>
    </Modal>
  );
}

function MetricsView({ data, updateData }) {
  const [metricKey, setMetricKey] = useState('mrr');
  const [snapshotModal, setSnapshotModal] = useState(null);
  const [cohortModal, setCohortModal] = useState(null);

  const snapshots = useMemo(() => [...data.metricsSnapshots].sort((a, b) => a.date.localeCompare(b.date)), [data.metricsSnapshots]);
  const latest = snapshots[snapshots.length - 1] || null;
  const unit = data.metrics.unitEconomics;

  const ltv = num(unit.monthlyChurnPct) > 0
    ? round((num(unit.arpu) * (num(unit.grossMarginPct) / 100)) / (num(unit.monthlyChurnPct) / 100), 2)
    : 0;
  const payback = num(unit.arpu) * (num(unit.grossMarginPct) / 100) > 0
    ? round(num(unit.cac) / (num(unit.arpu) * (num(unit.grossMarginPct) / 100)), 2)
    : 0;

  const fundraising = data.metrics.fundraising;
  const fundProgress = fundraising.target > 0 ? Math.round((num(fundraising.raised) / num(fundraising.target)) * 100) : 0;

  return (
    <div className="space-y-6 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <h3 className="font-heading text-lg font-semibold">Growth Over Time</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track core traction metrics month by month.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select className="input-field" value={metricKey} onChange={(event) => setMetricKey(event.target.value)}>
              <option value="mrr">MRR</option>
              <option value="customers">Customers</option>
              <option value="wau">Weekly Active Users</option>
              <option value="momGrowth">MoM Growth %</option>
            </select>
            <button
              className="btn-primary"
              onClick={() => setSnapshotModal({
                id: null,
                date: toDateISO(),
                mrr: latest?.mrr || 0,
                customers: latest?.customers || 0,
                wau: latest?.wau || 0,
                momGrowth: latest?.momGrowth || 0,
                conversations: latest?.conversations || 0,
                burnRate: latest?.burnRate || 0,
                cashInBank: latest?.cashInBank || 0
              })}
            >
              Add Snapshot
            </button>
          </div>
        </div>
        <LineChart data={snapshots} metricKey={metricKey} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card-panel p-4">
          <h3 className="font-heading text-lg font-semibold mb-3">Unit Economics Calculator</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">ARPU (monthly)</label>
              <input
                type="number"
                className="input-field"
                value={unit.arpu}
                onChange={(event) => updateData((draft) => { draft.metrics.unitEconomics.arpu = num(event.target.value); })}
              />
            </div>
            <div>
              <label className="label">Gross Margin %</label>
              <input
                type="number"
                className="input-field"
                value={unit.grossMarginPct}
                onChange={(event) => updateData((draft) => { draft.metrics.unitEconomics.grossMarginPct = num(event.target.value); })}
              />
            </div>
            <div>
              <label className="label">Monthly Churn %</label>
              <input
                type="number"
                className="input-field"
                value={unit.monthlyChurnPct}
                onChange={(event) => updateData((draft) => { draft.metrics.unitEconomics.monthlyChurnPct = num(event.target.value); })}
              />
            </div>
            <div>
              <label className="label">CAC</label>
              <input
                type="number"
                className="input-field"
                value={unit.cac}
                onChange={(event) => updateData((draft) => { draft.metrics.unitEconomics.cac = num(event.target.value); })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 mt-4">
            <MetricCard title="LTV" value={formatMoney(ltv)} />
            <MetricCard title="CAC" value={formatMoney(unit.cac)} />
            <MetricCard title="Payback" value={`${payback || 0} months`} tone={payback > 12 ? 'bad' : payback > 6 ? 'warn' : 'good'} />
          </div>
        </article>

        <article className="card-panel p-4 space-y-4">
          <div>
            <h3 className="font-heading text-lg font-semibold">Burn Rate and Runway</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Directly updates latest snapshot.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Burn Rate / month</label>
              <input
                type="number"
                className="input-field"
                value={latest?.burnRate || 0}
                onChange={(event) => {
                  const burn = num(event.target.value);
                  updateData((draft) => {
                    const snapshotsList = [...draft.metricsSnapshots].sort((a, b) => a.date.localeCompare(b.date));
                    const target = snapshotsList[snapshotsList.length - 1];
                    if (!target) return;
                    target.burnRate = burn;
                    target.runwayMonths = burn > 0 ? round(num(target.cashInBank) / burn, 1) : 0;
                    target.updatedAt = nowISO();
                  });
                }}
              />
            </div>
            <div>
              <label className="label">Cash in Bank</label>
              <input
                type="number"
                className="input-field"
                value={latest?.cashInBank || 0}
                onChange={(event) => {
                  const cash = num(event.target.value);
                  updateData((draft) => {
                    const snapshotsList = [...draft.metricsSnapshots].sort((a, b) => a.date.localeCompare(b.date));
                    const target = snapshotsList[snapshotsList.length - 1];
                    if (!target) return;
                    target.cashInBank = cash;
                    target.runwayMonths = num(target.burnRate) > 0 ? round(cash / num(target.burnRate), 1) : 0;
                    target.updatedAt = nowISO();
                  });
                }}
              />
            </div>
          </div>
          <MetricCard title="Runway" value={`${round(latest?.runwayMonths || 0, 1)} months`} tone={num(latest?.runwayMonths) > 12 ? 'good' : num(latest?.runwayMonths) > 6 ? 'warn' : 'bad'} />
        </article>
      </section>

      <section className="card-panel p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h3 className="font-heading text-lg font-semibold">Cohort Analysis</h3>
          <button
            className="btn-secondary"
            onClick={() => setCohortModal({ id: null, name: '', startMonth: toMonthISO(), users: 0, retention: [100, 0, 0, 0, 0, 0] })}
          >
            Add Cohort
          </button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-3">Cohort</th>
                <th className="py-2 pr-3">Start</th>
                <th className="py-2 pr-3">Users</th>
                <th className="py-2 pr-3">M0</th>
                <th className="py-2 pr-3">M1</th>
                <th className="py-2 pr-3">M2</th>
                <th className="py-2 pr-3">M3</th>
                <th className="py-2 pr-3">M4</th>
                <th className="py-2 pr-3">M5</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.metrics.cohorts.map((cohort) => (
                <tr key={cohort.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-3 font-medium">{cohort.name}</td>
                  <td className="py-2 pr-3">{cohort.startMonth}</td>
                  <td className="py-2 pr-3">{cohort.users}</td>
                  {cohort.retention.map((value, index) => (
                    <td key={`${cohort.id}_${index}`} className="py-2 pr-3">{round(value, 1)}%</td>
                  ))}
                  <td className="py-2 flex gap-2">
                    <button className="btn-secondary px-3 py-1.5" onClick={() => setCohortModal(cohort)}>Edit</button>
                    <button
                      className="btn-danger px-3 py-1.5"
                      onClick={() => {
                        if (!window.confirm('Delete this cohort?')) return;
                        updateData((draft) => {
                          draft.metrics.cohorts = draft.metrics.cohorts.filter((item) => item.id !== cohort.id);
                        });
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-panel p-4">
        <h3 className="font-heading text-lg font-semibold mb-3">Fundraising Tracker</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label">Target Raise</label>
            <input
              type="number"
              className="input-field"
              value={fundraising.target}
              onChange={(event) => updateData((draft) => { draft.metrics.fundraising.target = num(event.target.value); })}
            />
          </div>
          <div>
            <label className="label">Raised So Far</label>
            <input
              type="number"
              className="input-field"
              value={fundraising.raised}
              onChange={(event) => updateData((draft) => { draft.metrics.fundraising.raised = num(event.target.value); })}
            />
          </div>
          <div>
            <label className="label">Runway Extension (months)</label>
            <input
              type="number"
              className="input-field"
              value={fundraising.runwayExtensionMonths}
              onChange={(event) => updateData((draft) => { draft.metrics.fundraising.runwayExtensionMonths = num(event.target.value); })}
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
            <span>Fundraising Progress</span>
            <span>{fundProgress}%</span>
          </div>
          <ProgressBar progress={fundProgress} />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{formatMoney(fundraising.raised)} of {formatMoney(fundraising.target)} raised, extending runway by {fundraising.runwayExtensionMonths} months.</p>
        </div>
      </section>

      <section className="card-panel p-4">
        <h3 className="font-heading text-lg font-semibold mb-3">Snapshot History</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">MRR</th>
                <th className="py-2 pr-3">Customers</th>
                <th className="py-2 pr-3">WAU</th>
                <th className="py-2 pr-3">Growth</th>
                <th className="py-2 pr-3">Runway</th>
                <th className="py-2 pr-3">Conversations</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...snapshots].reverse().map((snapshot) => (
                <tr key={snapshot.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-3">{snapshot.date}</td>
                  <td className="py-2 pr-3">{formatMoney(snapshot.mrr)}</td>
                  <td className="py-2 pr-3">{snapshot.customers}</td>
                  <td className="py-2 pr-3">{snapshot.wau}</td>
                  <td className={`py-2 pr-3 ${growthClass(snapshot.momGrowth)}`}>{formatPct(snapshot.momGrowth)}</td>
                  <td className="py-2 pr-3">{snapshot.runwayMonths}m</td>
                  <td className="py-2 pr-3">{snapshot.conversations}</td>
                  <td className="py-2 flex gap-2">
                    <button className="btn-secondary px-3 py-1.5" onClick={() => setSnapshotModal(snapshot)}>Edit</button>
                    <button
                      className="btn-danger px-3 py-1.5"
                      onClick={() => {
                        if (!window.confirm('Delete this snapshot?')) return;
                        updateData((draft) => {
                          draft.metricsSnapshots = draft.metricsSnapshots.filter((item) => item.id !== snapshot.id);
                          if (!draft.metricsSnapshots.length) {
                            draft.metricsSnapshots = createDefaultData().metricsSnapshots;
                          }
                        });
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {snapshotModal ? (
        <MetricSnapshotModal
          value={snapshotModal}
          onChange={setSnapshotModal}
          onClose={() => setSnapshotModal(null)}
          onSave={() => {
            updateData((draft) => {
              const burn = num(snapshotModal.burnRate);
              const cash = num(snapshotModal.cashInBank);
              const payload = {
                date: snapshotModal.date,
                mrr: num(snapshotModal.mrr),
                arr: num(snapshotModal.mrr) * 12,
                customers: num(snapshotModal.customers),
                wau: num(snapshotModal.wau),
                momGrowth: num(snapshotModal.momGrowth),
                conversations: num(snapshotModal.conversations),
                burnRate: burn,
                cashInBank: cash,
                runwayMonths: burn > 0 ? round(cash / burn, 1) : 0,
                updatedAt: nowISO()
              };

              if (snapshotModal.id) {
                const target = draft.metricsSnapshots.find((item) => item.id === snapshotModal.id);
                if (!target) return;
                Object.assign(target, payload);
              } else {
                draft.metricsSnapshots.push({
                  id: uid('snap'),
                  ...payload,
                  createdAt: nowISO()
                });
              }
            });
            setSnapshotModal(null);
          }}
        />
      ) : null}

      {cohortModal ? (
        <CohortModal
          value={cohortModal}
          onChange={setCohortModal}
          onClose={() => setCohortModal(null)}
          onSave={() => {
            if (!cohortModal.name.trim()) return;
            updateData((draft) => {
              const normalizedRetention = (cohortModal.retention || []).slice(0, 6).map((item) => clamp(num(item), 0, 100));
              while (normalizedRetention.length < 6) normalizedRetention.push(0);

              if (cohortModal.id) {
                const target = draft.metrics.cohorts.find((item) => item.id === cohortModal.id);
                if (!target) return;
                target.name = cohortModal.name.trim();
                target.startMonth = cohortModal.startMonth;
                target.users = num(cohortModal.users);
                target.retention = normalizedRetention;
                target.updatedAt = nowISO();
              } else {
                draft.metrics.cohorts.push({
                  id: uid('cohort'),
                  name: cohortModal.name.trim(),
                  startMonth: cohortModal.startMonth,
                  users: num(cohortModal.users),
                  retention: normalizedRetention,
                  createdAt: nowISO(),
                  updatedAt: nowISO()
                });
              }
            });
            setCohortModal(null);
          }}
        />
      ) : null}
    </div>
  );
}

function AIWorkflowModal({ value, onChange, onClose, onSave }) {
  return (
    <Modal title={value.id ? 'Edit AI Workflow' : 'Add AI Workflow'} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.title.trim() || !value.template.trim()) return;
          onSave();
        }}
      >
        <div>
          <label className="label">Category</label>
          <input className="input-field" value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value })} required />
        </div>
        <div>
          <label className="label">Title</label>
          <input className="input-field" value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} required />
        </div>
        <div>
          <label className="label">Template</label>
          <textarea className="input-field min-h-32" value={value.template} onChange={(event) => onChange({ ...value, template: event.target.value })} required />
        </div>
        <button type="submit" className="btn-primary">Save Workflow</button>
      </form>
    </Modal>
  );
}

function AIWorkflowsView({ data, updateData, onToast }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [modal, setModal] = useState(null);

  const categories = useMemo(() => ['All', ...Array.from(new Set(data.aiWorkflows.map((item) => item.category)))], [data.aiWorkflows]);
  const filtered = useMemo(() => {
    return data.aiWorkflows.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const haystack = `${item.title} ${item.category} ${item.template}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [data.aiWorkflows, category, search]);

  async function copyTemplate(text) {
    try {
      await navigator.clipboard.writeText(text);
      onToast('Prompt copied to clipboard.');
    } catch (error) {
      onToast('Copy failed. You can manually copy the template.');
    }
  }

  return (
    <div className="space-y-4 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="label">Search</label>
            <input className="input-field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find prompt templates" />
          </div>
          <div className="min-w-[180px]">
            <label className="label">Category</label>
            <select className="input-field" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <button
            className="btn-primary"
            onClick={() => setModal({ id: null, category: 'General', title: '', template: '' })}
          >
            Add Workflow
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {filtered.map((workflow) => (
          <article key={workflow.id} className="card-panel p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">{workflow.category}</span>
                <h3 className="font-heading text-lg font-semibold mt-2">{workflow.title}</h3>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary px-3 py-1.5" onClick={() => setModal(workflow)}>Edit</button>
                <button
                  className="btn-danger px-3 py-1.5"
                  onClick={() => {
                    if (!window.confirm('Delete this workflow?')) return;
                    updateData((draft) => {
                      draft.aiWorkflows = draft.aiWorkflows.filter((item) => item.id !== workflow.id);
                    });
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <textarea className="input-field mt-3 min-h-40" value={workflow.template} readOnly />
            <div className="mt-2 flex justify-end">
              <button className="btn-primary px-3 py-1.5" onClick={() => copyTemplate(workflow.template)}>Copy Template</button>
            </div>
          </article>
        ))}
      </section>

      {modal ? (
        <AIWorkflowModal
          value={modal}
          onChange={setModal}
          onClose={() => setModal(null)}
          onSave={() => {
            updateData((draft) => {
              if (modal.id) {
                const target = draft.aiWorkflows.find((item) => item.id === modal.id);
                if (!target) return;
                target.category = modal.category.trim();
                target.title = modal.title.trim();
                target.template = modal.template.trim();
                target.updatedAt = nowISO();
              } else {
                draft.aiWorkflows.unshift({
                  id: uid('ai'),
                  category: modal.category.trim(),
                  title: modal.title.trim(),
                  template: modal.template.trim(),
                  createdAt: nowISO(),
                  updatedAt: nowISO()
                });
              }
            });
            setModal(null);
          }}
        />
      ) : null}
    </div>
  );
}

function WeeklyRhythmView({ data, updateData, onGenerateSummary }) {
  const weekStart = toWeekStartISO();
  const weekLogs = data.weeklyRhythm.logs.filter((entry) => entry.weekStart === weekStart);
  const [drafts, setDrafts] = useState(() => {
    const initial = {};
    RHYTHM_DAYS.forEach((day) => {
      const existing = weekLogs.find((item) => item.dayKey === day.key);
      initial[day.key] = existing?.content || '';
    });
    return initial;
  });

  useEffect(() => {
    const initial = {};
    RHYTHM_DAYS.forEach((day) => {
      const existing = weekLogs.find((item) => item.dayKey === day.key);
      initial[day.key] = existing?.content || '';
    });
    setDrafts(initial);
  }, [weekStart, data.weeklyRhythm.logs]);

  const completion = getCurrentWeekRhythmCompletion(data.weeklyRhythm.logs);

  function saveDay(dayKey, completeOverride) {
    const content = drafts[dayKey] || '';
    updateData((draft) => {
      const logs = draft.weeklyRhythm.logs;
      const existing = logs.find((entry) => entry.weekStart === weekStart && entry.dayKey === dayKey);
      if (existing) {
        existing.content = content.trim();
        if (typeof completeOverride === 'boolean') existing.complete = completeOverride;
        existing.updatedAt = nowISO();
      } else {
        logs.push({
          id: uid('rhythm'),
          weekStart,
          dayKey,
          content: content.trim(),
          complete: typeof completeOverride === 'boolean' ? completeOverride : false,
          createdAt: nowISO(),
          updatedAt: nowISO()
        });
      }
    });
  }

  return (
    <div className="space-y-4 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <h3 className="font-heading text-lg font-semibold">Weekly Operating Rhythm</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Week starting {weekStart}</p>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Completion: {completion}%</div>
        </div>
        <ProgressBar progress={completion} />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {RHYTHM_DAYS.map((day) => {
          const log = weekLogs.find((item) => item.dayKey === day.key);
          return (
            <article key={day.key} className="card-panel p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{day.day}</p>
                  <h4 className="font-heading text-lg font-semibold">{day.focus}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{day.prompt}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(log?.complete)}
                    onChange={(event) => saveDay(day.key, event.target.checked)}
                  />
                  Complete
                </label>
              </div>
              <textarea
                className="input-field min-h-28 mt-3"
                value={drafts[day.key] || ''}
                onChange={(event) => setDrafts((prev) => ({ ...prev, [day.key]: event.target.value }))}
                placeholder={`Log ${day.focus.toLowerCase()} execution details...`}
              />
              <div className="mt-2 flex justify-end">
                <button className="btn-secondary" onClick={() => saveDay(day.key, log?.complete || false)}>Save Note</button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="card-panel p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="font-heading text-lg font-semibold">Automated Weekly Review Summary</h3>
          <button className="btn-primary" onClick={() => onGenerateSummary(weekStart)}>Generate and Save</button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">Generates a structured summary from your week logs, goals, and metrics, then stores it in the weekly reviews knowledge base.</p>
      </section>
    </div>
  );
}

function LogbookView({ data, updateData }) {
  const entries = data.logbook || [];
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    date: toDateISO(),
    category: 'General',
    title: '',
    tags: '',
    content: ''
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) => {
      const haystack = [
        entry.date,
        entry.category,
        entry.title,
        entry.content,
        (entry.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [entries, search]);

  function parseTags(value) {
    return String(value || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function clearForm() {
    setEditingId(null);
    setForm({
      date: toDateISO(),
      category: 'General',
      title: '',
      tags: '',
      content: ''
    });
  }

  function saveEntry(event) {
    event.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) return;

    if (editingId) {
      updateData((draft) => {
        const list = Array.isArray(draft.logbook) ? draft.logbook : [];
        const target = list.find((item) => item.id === editingId);
        if (!target) return;
        target.date = form.date || toDateISO();
        target.category = form.category || 'General';
        target.title = title;
        target.content = content;
        target.tags = parseTags(form.tags);
        target.updatedAt = nowISO();
      });
      clearForm();
      return;
    }

    updateData((draft) => {
      if (!Array.isArray(draft.logbook)) draft.logbook = [];
      draft.logbook.unshift({
        id: uid('log'),
        date: form.date || toDateISO(),
        category: form.category || 'General',
        title,
        content,
        tags: parseTags(form.tags),
        createdAt: nowISO(),
        updatedAt: nowISO()
      });
    });
    clearForm();
  }

  function editEntry(entry) {
    setEditingId(entry.id);
    setForm({
      date: entry.date || toDateISO(),
      category: entry.category || 'General',
      title: entry.title || '',
      tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : '',
      content: entry.content || ''
    });
  }

  function deleteEntry(id) {
    if (!window.confirm('Delete this log entry?')) return;
    updateData((draft) => {
      const list = Array.isArray(draft.logbook) ? draft.logbook : [];
      draft.logbook = list.filter((item) => item.id !== id);
    });
    if (editingId === id) clearForm();
  }

  return (
    <div className="space-y-4 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-heading text-lg font-semibold">Universal Founder Logbook</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Capture everything here so your system replaces Notion.</p>
          </div>
          <span className="metric-pill">{entries.length} total entries</span>
        </div>
      </section>

      <section className="card-panel p-4">
        <h4 className="font-heading text-lg font-semibold mb-3">{editingId ? 'Edit Log Entry' : 'Add Log Entry'}</h4>
        <form className="space-y-3" onSubmit={saveEntry}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">Date
              <input
                type="date"
                className="input-field mt-1"
                value={form.date}
                onChange={(event) => updateForm('date', event.target.value)}
              />
            </label>
            <label className="text-sm">Category
              <input
                className="input-field mt-1"
                placeholder="General / Sales / Product / Learning"
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
              />
            </label>
          </div>
          <label className="text-sm block">Title
            <input
              className="input-field mt-1"
              placeholder="Short title"
              value={form.title}
              onChange={(event) => updateForm('title', event.target.value)}
            />
          </label>
          <label className="text-sm block">Tags (comma separated)
            <input
              className="input-field mt-1"
              placeholder="founder, interview, mrr"
              value={form.tags}
              onChange={(event) => updateForm('tags', event.target.value)}
            />
          </label>
          <label className="text-sm block">Details
            <textarea
              className="input-field mt-1 min-h-32"
              placeholder="Write your full notes, decisions, learnings, ideas, and follow-ups..."
              value={form.content}
              onChange={(event) => updateForm('content', event.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">{editingId ? 'Update Entry' : 'Save Entry'}</button>
            <button className="btn-secondary" type="button" onClick={clearForm}>Clear</button>
          </div>
        </form>
      </section>

      <section className="card-panel p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h4 className="font-heading text-lg font-semibold">Entry Archive</h4>
          <input
            className="input-field max-w-md"
            placeholder="Search by title, tags, content, date..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          {filtered.length ? filtered.map((entry) => (
            <article key={entry.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">{entry.date} • {entry.category}</p>
                  <h5 className="font-medium">{entry.title}</h5>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => editEntry(entry)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteEntry(entry.id)}>Delete</button>
                </div>
              </div>
              {Array.isArray(entry.tags) && entry.tags.length ? (
                <p className="text-xs text-slate-500 mt-1">Tags: {entry.tags.join(', ')}</p>
              ) : null}
              <p className="text-sm whitespace-pre-wrap mt-2">{entry.content}</p>
            </article>
          )) : (
            <p className="text-sm text-slate-500">No entries found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function DocumentsLibraryView({ data, updateData }) {
  const documents = Array.isArray(data.documents) ? data.documents : [];
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id || '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!documents.length) {
      setActiveDocId('');
      return;
    }
    const exists = documents.some((doc) => doc.id === activeDocId);
    if (!exists) setActiveDocId(documents[0].id);
  }, [documents, activeDocId]);

  const activeDoc = documents.find((doc) => doc.id === activeDocId) || null;

  const filteredSections = useMemo(() => {
    if (!activeDoc || !Array.isArray(activeDoc.sections)) return [];
    const query = search.trim().toLowerCase();
    if (!query) return activeDoc.sections;
    return activeDoc.sections.filter((section) => (
      `${section.title} ${section.content}`.toLowerCase().includes(query)
    ));
  }, [activeDoc, search]);

  function updateDocField(docId, field, value) {
    updateData((draft) => {
      const docs = Array.isArray(draft.documents) ? draft.documents : [];
      const target = docs.find((doc) => doc.id === docId);
      if (!target) return;
      target[field] = value;
      target.updatedAt = nowISO();
    });
  }

  function updateSectionField(docId, sectionId, field, value) {
    updateData((draft) => {
      const docs = Array.isArray(draft.documents) ? draft.documents : [];
      const targetDoc = docs.find((doc) => doc.id === docId);
      if (!targetDoc || !Array.isArray(targetDoc.sections)) return;
      const targetSection = targetDoc.sections.find((section) => section.id === sectionId);
      if (!targetSection) return;
      targetSection[field] = value;
      targetSection.updatedAt = nowISO();
      targetDoc.updatedAt = nowISO();
    });
  }

  function addSection(docId) {
    updateData((draft) => {
      const docs = Array.isArray(draft.documents) ? draft.documents : [];
      const target = docs.find((doc) => doc.id === docId);
      if (!target) return;
      if (!Array.isArray(target.sections)) target.sections = [];
      target.sections.push({
        id: uid('section'),
        title: `New Section ${target.sections.length + 1}`,
        content: '',
        createdAt: nowISO(),
        updatedAt: nowISO()
      });
      target.updatedAt = nowISO();
    });
  }

  function deleteSection(docId, sectionId) {
    if (!window.confirm('Delete this section?')) return;
    updateData((draft) => {
      const docs = Array.isArray(draft.documents) ? draft.documents : [];
      const targetDoc = docs.find((doc) => doc.id === docId);
      if (!targetDoc || !Array.isArray(targetDoc.sections)) return;
      targetDoc.sections = targetDoc.sections.filter((section) => section.id !== sectionId);
      targetDoc.updatedAt = nowISO();
    });
  }

  function addDocument() {
    const name = window.prompt('Document title');
    if (!name || !name.trim()) return;
    const nextId = uid('doc');
    updateData((draft) => {
      if (!Array.isArray(draft.documents)) draft.documents = [];
      draft.documents.push({
        id: nextId,
        title: name.trim(),
        sourceFile: 'Custom Document',
        sections: [
          {
            id: uid('section'),
            title: 'New Section 1',
            content: '',
            createdAt: nowISO(),
            updatedAt: nowISO()
          }
        ],
        createdAt: nowISO(),
        updatedAt: nowISO()
      });
    });
    setActiveDocId(nextId);
  }

  function deleteDocument(docId) {
    if (!window.confirm('Delete this document and all its sections?')) return;
    updateData((draft) => {
      const docs = Array.isArray(draft.documents) ? draft.documents : [];
      draft.documents = docs.filter((doc) => doc.id !== docId);
    });
  }

  function restoreTemplateDocs() {
    if (!window.confirm('Restore template docs from Founder_Operating_System.docx and Zero_To_Founder_War_Mode.docx? This keeps your current data in other modules.')) return;
    updateData((draft) => {
      draft.documents = createDocumentLibrary();
    });
  }

  return (
    <div className="space-y-4 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-heading text-lg font-semibold">Document Sections Library</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Both uploaded files are loaded as editable and deletable sections.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={restoreTemplateDocs}>Restore Templates</button>
            <button className="btn-primary" onClick={addDocument}>Add Document</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="card-panel p-3">
          <h4 className="font-heading text-sm font-semibold mb-2">Documents</h4>
          <div className="space-y-2">
            {documents.length ? documents.map((doc) => (
              <button
                key={doc.id}
                className={`w-full text-left rounded-lg border px-3 py-2 ${activeDocId === doc.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                onClick={() => setActiveDocId(doc.id)}
              >
                <p className="font-medium text-sm">{doc.title}</p>
                <p className="text-xs text-slate-500 mt-1">{doc.sourceFile || 'Custom Document'}</p>
                <p className="text-xs text-slate-500">{Array.isArray(doc.sections) ? doc.sections.length : 0} sections</p>
              </button>
            )) : (
              <p className="text-sm text-slate-500">No documents yet.</p>
            )}
          </div>
        </aside>

        <div className="card-panel p-4">
          {activeDoc ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <label className="text-xs uppercase tracking-wide text-slate-500">Document title</label>
                  <input
                    className="input-field mt-1"
                    value={activeDoc.title || ''}
                    onChange={(event) => updateDocField(activeDoc.id, 'title', event.target.value)}
                  />
                </div>
                <div className="self-end">
                  <button className="btn-danger" onClick={() => deleteDocument(activeDoc.id)}>Delete Document</button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  className="input-field"
                  value={activeDoc.sourceFile || ''}
                  onChange={(event) => updateDocField(activeDoc.id, 'sourceFile', event.target.value)}
                  placeholder="Source file name"
                />
                <button className="btn-primary" onClick={() => addSection(activeDoc.id)}>Add Section</button>
              </div>

              <input
                className="input-field"
                placeholder="Search section title/content..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="space-y-3">
                {filteredSections.length ? filteredSections.map((section) => (
                  <article key={section.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <input
                        className="input-field"
                        value={section.title || ''}
                        onChange={(event) => updateSectionField(activeDoc.id, section.id, 'title', event.target.value)}
                      />
                      <button className="btn-danger" onClick={() => deleteSection(activeDoc.id, section.id)}>Delete</button>
                    </div>
                    <textarea
                      className="input-field min-h-44"
                      value={section.content || ''}
                      onChange={(event) => updateSectionField(activeDoc.id, section.id, 'content', event.target.value)}
                    />
                  </article>
                )) : (
                  <p className="text-sm text-slate-500">No sections matched your search.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Select a document to edit sections.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function FounderManualView({ data, updateData }) {
  const [tab, setTab] = useState('truths');
  const manual = data.manual || createFounderManualState();

  const completion = useMemo(() => {
    const truthsDone = manual.brutalTruths.filter((item) => item.acknowledged).length;
    const scheduleDone = manual.dailySchedule.filter((item) => item.done).length;
    const sprintDone = manual.thirtyDayPlan.filter((item) => item.done).length;
    const total = manual.brutalTruths.length + manual.dailySchedule.length + manual.thirtyDayPlan.length;
    const done = truthsDone + scheduleDone + sprintDone;
    return total ? Math.round((done / total) * 100) : 0;
  }, [manual]);

  function updateManualItem(listKey, id, field, value) {
    updateData((draft) => {
      const list = draft.manual?.[listKey];
      if (!Array.isArray(list)) return;
      const target = list.find((item) => item.id === id);
      if (!target) return;
      target[field] = value;
      draft.manual.updatedAt = nowISO();
    });
  }

  function updateTenTenTen(field, value) {
    updateData((draft) => {
      draft.manual.tenTenTen[field] = value;
      draft.manual.updatedAt = nowISO();
    });
  }

  return (
    <div className="space-y-4 animate-slideFade">
      <section className="card-panel p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-heading text-lg font-semibold">Founder OS Operating Manual (v1)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Built from your uploaded Founder_OS document. Execute daily, validate weekly, review monthly.</p>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Manual completion: {completion}%</div>
        </div>
        <div className="mt-3"><ProgressBar progress={completion} /></div>
      </section>

      <section className="card-panel p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            ['truths', 'Brutal Truths'],
            ['schedule', 'Daily Schedule'],
            ['weekly', 'Weekly Model'],
            ['validation', 'Validation Funnel'],
            ['distractions', 'Distraction System'],
            ['kpis', 'KPI Templates'],
            ['decisions', 'Decision Framework'],
            ['sprint', '30-Day Plan'],
            ['maintenance', 'Maintenance']
          ].map(([key, label]) => (
            <button
              key={key}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab === key ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {tab === 'truths' ? (
        <section className="card-panel p-4 space-y-3">
          <h4 className="font-heading text-lg font-semibold">01. Brutal Truths First</h4>
          {manual.brutalTruths.map((item, index) => (
            <article key={item.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">TRUTH {index + 1}: {item.text}</p>
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(item.acknowledged)}
                    onChange={(event) => updateManualItem('brutalTruths', item.id, 'acknowledged', event.target.checked)}
                  />
                  Acknowledged
                </label>
              </div>
              <textarea
                className="input-field mt-2 min-h-20"
                placeholder="Personal note: where this truth is currently showing up"
                value={item.note || ''}
                onChange={(event) => updateManualItem('brutalTruths', item.id, 'note', event.target.value)}
              />
            </article>
          ))}
        </section>
      ) : null}

      {tab === 'schedule' ? (
        <section className="card-panel p-4 space-y-3">
          <h4 className="font-heading text-lg font-semibold">02. Daily Execution Schedule</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Block</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Required Output</th>
                  <th className="py-2 pr-3">Done</th>
                </tr>
              </thead>
              <tbody>
                {DAILY_EXECUTION_SCHEDULE.map((row) => {
                  const log = manual.dailySchedule.find((item) => item.id === row.id) || {};
                  return (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 pr-3 whitespace-nowrap">{row.time}</td>
                      <td className="py-2 pr-3 font-medium">{row.block}</td>
                      <td className="py-2 pr-3">{row.action}</td>
                      <td className="py-2 pr-3">{row.output}</td>
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={Boolean(log.done)}
                          onChange={(event) => updateManualItem('dailySchedule', row.id, 'done', event.target.checked)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Audio/Drive Protocol: Every audio session must produce one output note. Never consume without output.
          </p>
        </section>
      ) : null}

      {tab === 'weekly' ? (
        <section className="card-panel p-4 space-y-3">
          <h4 className="font-heading text-lg font-semibold">03. Weekly Operating Model</h4>
          <div className="space-y-2">
            {WEEKLY_OPERATING_MODEL.map((row) => {
              const log = manual.weeklyModel.find((item) => item.id === row.id) || {};
              return (
                <article key={row.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{row.day}: {row.theme}</p>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(log.done)}
                        onChange={(event) => updateManualItem('weeklyModel', row.id, 'done', event.target.checked)}
                      />
                      Complete
                    </label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{row.focus}</p>
                  <p className="text-xs text-slate-500 mt-1">Required: {row.output}</p>
                  <textarea
                    className="input-field mt-2 min-h-20"
                    placeholder="Output log"
                    value={log.outputLog || ''}
                    onChange={(event) => updateManualItem('weeklyModel', row.id, 'outputLog', event.target.value)}
                  />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {tab === 'validation' ? (
        <section className="card-panel p-4 space-y-3">
          <h4 className="font-heading text-lg font-semibold">04. Idea Validation Funnel</h4>
          <div className="space-y-2">
            {VALIDATION_FUNNEL.map((row) => {
              const log = manual.validationFunnel.find((item) => item.id === row.id) || {};
              return (
                <article key={row.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{row.stage} <span className="text-xs text-slate-500">({row.timeBox})</span></p>
                    <div className="flex items-center gap-4 text-xs">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(log.passed)}
                          onChange={(event) => updateManualItem('validationFunnel', row.id, 'passed', event.target.checked)}
                        />
                        Pass
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(log.killed)}
                          onChange={(event) => updateManualItem('validationFunnel', row.id, 'killed', event.target.checked)}
                        />
                        Kill
                      </label>
                    </div>
                  </div>
                  <p className="text-sm mt-1">{row.action}</p>
                  <p className="text-xs text-emerald-600 mt-1">Pass criteria: {row.pass}</p>
                  <p className="text-xs text-rose-600 mt-1">Kill criteria: {row.kill}</p>
                  <textarea
                    className="input-field mt-2 min-h-20"
                    placeholder="Evidence notes"
                    value={log.notes || ''}
                    onChange={(event) => updateManualItem('validationFunnel', row.id, 'notes', event.target.value)}
                  />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {tab === 'distractions' ? (
        <section className="card-panel p-4 space-y-3">
          <h4 className="font-heading text-lg font-semibold">05. Distraction Elimination System</h4>
          <div className="space-y-2">
            {DISTRACTION_AUDIT.map((row) => {
              const log = manual.distractionAudit.find((item) => item.id === row.id) || {};
              return (
                <article key={row.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{row.type}</p>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(log.enabled)}
                        onChange={(event) => updateManualItem('distractionAudit', row.id, 'enabled', event.target.checked)}
                      />
                      Protocol Active
                    </label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{row.protocol}</p>
                  <textarea
                    className="input-field mt-2 min-h-20"
                    placeholder="Notes on slips and fixes"
                    value={log.notes || ''}
                    onChange={(event) => updateManualItem('distractionAudit', row.id, 'notes', event.target.value)}
                  />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {tab === 'kpis' ? (
        <section className="card-panel p-4 space-y-4">
          <h4 className="font-heading text-lg font-semibold">06. KPI Templates</h4>
          <div className="space-y-4">
            {[
              ['Daily KPIs', DAILY_METRIC_TEMPLATE, manual.dailyMetrics, 'dailyMetrics'],
              ['Weekly KPIs', WEEKLY_METRIC_TEMPLATE, manual.weeklyMetrics, 'weeklyMetrics'],
              ['Monthly Scorecard', MONTHLY_SCORECARD_TEMPLATE, manual.monthlyScorecard, 'monthlyScorecard']
            ].map(([title, template, values, key]) => (
              <article key={title} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <h5 className="font-medium mb-2">{title}</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-3">Metric</th>
                        <th className="py-2 pr-3">Target</th>
                        <th className="py-2 pr-3">Actual</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {template.map((row) => {
                        const log = (values || []).find((item) => item.id === row.id) || {};
                        return (
                          <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="py-2 pr-3">{row.metric}</td>
                            <td className="py-2 pr-3">{row.target}</td>
                            <td className="py-2 pr-3">
                              <input
                                className="input-field"
                                value={log.actual || ''}
                                onChange={(event) => updateManualItem(key, row.id, 'actual', event.target.value)}
                              />
                            </td>
                            <td className="py-2 pr-3">
                              <input
                                className="input-field"
                                value={log.status || ''}
                                onChange={(event) => updateManualItem(key, row.id, 'status', event.target.value)}
                                placeholder="On Track / Risk / Behind"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'decisions' ? (
        <section className="card-panel p-4 space-y-4">
          <h4 className="font-heading text-lg font-semibold">07. Decision-Making Framework</h4>
          <article className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <h5 className="font-medium mb-2">Founder Decision Matrix</h5>
            <div className="grid gap-2 md:grid-cols-2">
              {DECISION_MATRIX_TEMPLATE.map((row) => (
                <div key={row.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{row.quadrant}</p>
                  <p className="font-medium text-sm">{row.type}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{row.protocol}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <h5 className="font-medium mb-2">10-10-10 Rule + Hell Yes/No</h5>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="text-sm">In 10 days, regret?
                <input className="input-field mt-1" value={manual.tenTenTen.day10 || ''} onChange={(event) => updateTenTenTen('day10', event.target.value)} />
              </label>
              <label className="text-sm">In 10 months, still matters?
                <input className="input-field mt-1" value={manual.tenTenTen.month10 || ''} onChange={(event) => updateTenTenTen('month10', event.target.value)} />
              </label>
              <label className="text-sm">In 10 years, worth building?
                <input className="input-field mt-1" value={manual.tenTenTen.year10 || ''} onChange={(event) => updateTenTenTen('year10', event.target.value)} />
              </label>
              <label className="text-sm">Hell Yes or No?
                <input className="input-field mt-1" value={manual.tenTenTen.hellYes || ''} onChange={(event) => updateTenTenTen('hellYes', event.target.value)} />
              </label>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <h5 className="font-medium mb-2">Sector Prioritization</h5>
            <div className="space-y-2">
              {SECTOR_PRIORITIES.map((row) => {
                const log = manual.sectorDecisions.find((item) => item.id === row.id) || {};
                return (
                  <div key={row.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                    <p className="font-medium text-sm">{row.sector}</p>
                    <p className="text-xs text-slate-500 mt-1">GO criteria: {row.go}</p>
                    <div className="grid gap-2 md:grid-cols-2 mt-2">
                      <input
                        className="input-field"
                        placeholder="Decision (GO / NO-GO / WATCH)"
                        value={log.decision || ''}
                        onChange={(event) => updateManualItem('sectorDecisions', row.id, 'decision', event.target.value)}
                      />
                      <input
                        className="input-field"
                        placeholder="Notes"
                        value={log.notes || ''}
                        onChange={(event) => updateManualItem('sectorDecisions', row.id, 'notes', event.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      ) : null}

      {tab === 'sprint' ? (
        <section className="card-panel p-4 space-y-3">
          <h4 className="font-heading text-lg font-semibold">08. 30-Day Execution Plan</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-3">Day</th>
                  <th className="py-2 pr-3">Week</th>
                  <th className="py-2 pr-3">Task</th>
                  <th className="py-2 pr-3">Output Required</th>
                  <th className="py-2 pr-3">Done</th>
                  <th className="py-2 pr-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {THIRTY_DAY_PLAN.map((row) => {
                  const log = manual.thirtyDayPlan.find((item) => item.id === row.id) || {};
                  return (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800 align-top">
                      <td className="py-2 pr-3">{row.day}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{row.week}</td>
                      <td className="py-2 pr-3">{row.task}</td>
                      <td className="py-2 pr-3">{row.output}</td>
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={Boolean(log.done)}
                          onChange={(event) => updateManualItem('thirtyDayPlan', row.id, 'done', event.target.checked)}
                        />
                      </td>
                      <td className="py-2 pr-3 min-w-[240px]">
                        <input
                          className="input-field"
                          value={log.notes || ''}
                          onChange={(event) => updateManualItem('thirtyDayPlan', row.id, 'notes', event.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === 'maintenance' ? (
        <section className="card-panel p-4 space-y-4">
          <h4 className="font-heading text-lg font-semibold">09-10. Prioritization + System Maintenance</h4>
          <article className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <h5 className="font-medium mb-2">Weekly Forcing Questions</h5>
            <div className="space-y-2">
              {WEEKLY_FORCING_QUESTIONS.map((row) => {
                const log = manual.forcingQuestions.find((item) => item.id === row.id) || {};
                return (
                  <label key={row.id} className="block text-sm">
                    {row.question}
                    <textarea
                      className="input-field mt-1 min-h-20"
                      value={log.answer || ''}
                      onChange={(event) => updateManualItem('forcingQuestions', row.id, 'answer', event.target.value)}
                    />
                  </label>
                );
              })}
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <h5 className="font-medium mb-2">Monthly System Review Checklist</h5>
            <div className="space-y-2">
              {MONTHLY_REVIEW_CHECKS.map((row) => {
                const log = manual.monthlyReview.find((item) => item.id === row.id) || {};
                return (
                  <div key={row.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={Boolean(log.done)}
                        onChange={(event) => updateManualItem('monthlyReview', row.id, 'done', event.target.checked)}
                      />
                      {row.text}
                    </label>
                    <input
                      className="input-field mt-2"
                      placeholder="Notes"
                      value={log.notes || ''}
                      onChange={(event) => updateManualItem('monthlyReview', row.id, 'notes', event.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}

function App() {
  const [data, setData] = useState(() => normalizeData(loadFromStorage()));
  const [activeView, setActiveView] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMeta, setSyncMeta] = useState({
    lastPulledAt: null,
    lastPushedAt: null,
    serverUpdatedAt: null
  });
  const importInputRef = useRef(null);

  const currentMonth = calculateJourneyMonth(data);
  const currentRoadmap = data.execution.months.find((item) => item.month === currentMonth) || data.execution.months[0];
  const latestSnapshot = getLatestSnapshot(data);
  const journalStreak = getJournalStreak(data.knowledge.journals);
  const rhythmStreak = getWeeklyRhythmStreak(data.weeklyRhythm.logs);
  const consistencyScore = getConsistencyScore(data);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', Boolean(data.settings.darkMode));
  }, [data.settings.darkMode]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  function updateData(mutator) {
    setData((prev) => {
      const draft = cloneData(prev);
      mutator(draft);
      return normalizeData(draft);
    });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `founder-os-export-${toDateISO()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setToast('Data exported to JSON.');
  }

  function openImportDialog() {
    importInputRef.current?.click();
  }

  async function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!window.confirm('Importing JSON will replace current local Founder OS data. Continue?')) {
        return;
      }
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const normalized = normalizeData(parsed);
      setData(normalized);
      setToast('JSON imported successfully.');
    } catch (error) {
      console.error(error);
      setToast('Import failed. Invalid JSON format.');
    } finally {
      event.target.value = '';
    }
  }

  function resetData() {
    if (!window.confirm('Reset all Founder OS data? This cannot be undone.')) return;
    const fresh = normalizeData(createDefaultData());
    setData(fresh);
    setToast('Data reset complete.');
  }

  async function pullFromServer() {
    setSyncBusy(true);
    try {
      const response = await fetch('/api/founder-os', {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`Server pull failed (${response.status})`);
      }
      const payload = await response.json();
      if (!payload?.data || typeof payload.data !== 'object') {
        setToast('No server snapshot found to pull.');
        return;
      }
      setData(normalizeData(payload.data));
      setSyncMeta((prev) => ({
        ...prev,
        lastPulledAt: nowISO(),
        serverUpdatedAt: payload.updatedAt || prev.serverUpdatedAt
      }));
      setToast('Pulled latest data from server.');
    } catch (error) {
      console.error(error);
      setToast('Server pull failed.');
    } finally {
      setSyncBusy(false);
    }
  }

  async function pushToServer() {
    setSyncBusy(true);
    try {
      const response = await fetch('/api/founder-os', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      if (!response.ok) {
        throw new Error(`Server push failed (${response.status})`);
      }
      const payload = await response.json();
      setSyncMeta((prev) => ({
        ...prev,
        lastPushedAt: nowISO(),
        serverUpdatedAt: payload.updatedAt || prev.serverUpdatedAt
      }));
      setToast('Pushed local data to server.');
    } catch (error) {
      console.error(error);
      setToast('Server push failed.');
    } finally {
      setSyncBusy(false);
    }
  }

  function generateReport(type) {
    updateData((draft) => {
      const report = createReport(draft, type);
      draft.reports.unshift(report);
      draft.reports = draft.reports.slice(0, 24);
    });
    setToast(`${type === 'weekly' ? 'Weekly' : 'Monthly'} report generated.`);
  }

  function generateWeeklySummary(weekStart) {
    const summary = buildAutomatedWeeklySummary(data, weekStart);
    updateData((draft) => {
      draft.knowledge.weeklyReviews.unshift({
        id: uid('review'),
        weekStart,
        summary,
        wins: '',
        misses: '',
        nextFocus: '',
        createdAt: nowISO(),
        updatedAt: nowISO()
      });
    });
    setToast('Weekly review summary generated and saved.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex md:w-72 border-r border-slate-200 dark:border-slate-800 p-4 flex-col gap-4 print:hidden">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 shadow-soft">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">Founder OS</p>
            <h1 className="font-heading text-2xl font-semibold mt-1">Zero to Series A</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">12-month operating system</p>
          </div>
          <nav className="space-y-1 overflow-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ${activeView === item.id
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'bg-white/70 text-slate-700 hover:bg-white dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900'} `}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur bg-white/90 dark:bg-slate-950/90 print:hidden">
            <div className="px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Journey</p>
                <h2 className="font-heading text-xl font-semibold">Month {currentMonth} of 12 • {currentRoadmap?.title}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <StatusPill status={currentRoadmap?.status || 'Not Started'} />
                  <span className="text-sm text-slate-500 dark:text-slate-400">{currentRoadmap?.progress || 0}% phase progress</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="hidden lg:flex items-center gap-2">
                  <span className="metric-pill">MRR {formatMoney(latestSnapshot?.mrr || 0)}</span>
                  <span className="metric-pill">Customers {latestSnapshot?.customers || 0}</span>
                  <span className={`metric-pill ${growthClass(latestSnapshot?.momGrowth || 0)}`}>Growth {formatPct(latestSnapshot?.momGrowth || 0)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    className="btn-secondary"
                    onClick={() => updateData((draft) => { draft.settings.darkMode = !draft.settings.darkMode; })}
                  >
                    {data.settings.darkMode ? 'Light' : 'Dark'} Mode
                  </button>
                  <button className="btn-secondary" onClick={() => window.print()}>Print</button>
                  <button className="btn-secondary" onClick={exportJson}>Export JSON</button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={importJson}
                  />
                  <button className="btn-secondary" onClick={openImportDialog}>Import JSON</button>
                  <button className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed" onClick={pullFromServer} disabled={syncBusy}>
                    Pull Sync
                  </button>
                  <button className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed" onClick={pushToServer} disabled={syncBusy}>
                    Push Sync
                  </button>
                  <button className="btn-danger" onClick={resetData}>Reset</button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {syncBusy
                    ? 'Server sync in progress...'
                    : `Server updated: ${formatDateTime(syncMeta.serverUpdatedAt)} | Last pull: ${formatDateTime(syncMeta.lastPulledAt)} | Last push: ${formatDateTime(syncMeta.lastPushedAt)}`}
                </p>
              </div>
            </div>
            <div className="md:hidden px-4 pb-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={`mobile_${item.id}`}
                    onClick={() => setActiveView(item.id)}
                    className={`px-3 py-2 rounded-lg text-sm ${activeView === item.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="px-4 md:px-6 py-5 space-y-6">
            {activeView === 'logbook' ? <LogbookView data={data} updateData={updateData} /> : null}

            {activeView === 'documents' ? <DocumentsLibraryView data={data} updateData={updateData} /> : null}

            {activeView === 'manual' ? <FounderManualView data={data} updateData={updateData} /> : null}

            {activeView === 'dashboard' ? (
              <DashboardView
                data={data}
                currentMonth={currentMonth}
                currentRoadmap={currentRoadmap}
                latestSnapshot={latestSnapshot}
                updateData={updateData}
                setActiveView={setActiveView}
                onGenerateReport={generateReport}
                journalStreak={journalStreak}
                rhythmStreak={rhythmStreak}
                consistencyScore={consistencyScore}
              />
            ) : null}

            {activeView === 'execution' ? (
              <ExecutionView
                data={data}
                currentMonth={currentMonth}
                updateData={updateData}
              />
            ) : null}

            {activeView === 'learning' ? <LearningView data={data} updateData={updateData} /> : null}
            {activeView === 'decisions' ? <DecisionsView data={data} updateData={updateData} /> : null}
            {activeView === 'knowledge' ? <KnowledgeView data={data} updateData={updateData} /> : null}
            {activeView === 'metrics' ? <MetricsView data={data} updateData={updateData} /> : null}
            {activeView === 'ai' ? <AIWorkflowsView data={data} updateData={updateData} onToast={setToast} /> : null}
            {activeView === 'rhythm' ? <WeeklyRhythmView data={data} updateData={updateData} onGenerateSummary={generateWeeklySummary} /> : null}
          </div>
        </main>
      </div>

      {toast ? (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2 text-sm shadow-soft print:hidden">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
