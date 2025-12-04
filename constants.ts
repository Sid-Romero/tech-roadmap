
import { Project, Rank, Badge } from './types';

export const INITIAL_DATASET: Project[] = [
  {
    "id": "p1_1",
    "title": "Network Packet Analyzer",
    "level": 1,
    "status": "done",
    "category": "Network",
    "position": { "x": 100, "y": 100 },
    "dependencies": [],
    "description": "Create a Wireshark-lite in Python using raw sockets.",
    "tech_stack": ["Python", "Scapy"],
    "time_spent_hours": 12,
    "complexity": 2,
    "notes": "## Key Learnings\n- Understanding OSI Layer 2 vs Layer 3\n- Raw socket manipulation in Linux requires root privileges."
  },
  {
    "id": "p1_2",
    "title": "Custom DHCP Server",
    "level": 1,
    "status": "unlocked",
    "category": "Network",
    "position": { "x": 350, "y": 100 },
    "dependencies": ["p1_1"],
    "description": "Understand low-level IP assignment and DORA process.",
    "tech_stack": ["Python", "Sockets"],
    "complexity": 3
  },
  {
    "id": "p1_3",
    "title": "Subnet Calculator",
    "level": 1,
    "status": "locked",
    "category": "Network",
    "position": { "x": 600, "y": 100 },
    "dependencies": ["p1_2"],
    "description": "VLSM and IPAM calculation tool.",
    "tech_stack": ["Flask", "Bootstrap"],
    "complexity": 1
  },
  {
    "id": "p2_1",
    "title": "Homelab Infra",
    "level": 2,
    "status": "locked",
    "category": "Infra",
    "position": { "x": 100, "y": 300 },
    "dependencies": ["p1_1"],
    "description": "The heart of your personal infrastructure.",
    "tech_stack": ["Docker", "Ansible", "Pi"],
    "complexity": 3
  },
  {
    "id": "p2_2",
    "title": "AWS 3-Tier App",
    "level": 2,
    "status": "locked",
    "category": "Cloud",
    "position": { "x": 350, "y": 300 },
    "dependencies": ["p2_1"],
    "description": "Clean Cloud deployment via Terraform (IaC).",
    "tech_stack": ["AWS", "Terraform"],
    "complexity": 3
  },
  {
    "id": "p2_3",
    "title": "K8s Prod Cluster",
    "level": 2,
    "status": "locked",
    "category": "Cloud",
    "position": { "x": 600, "y": 300 },
    "dependencies": ["p2_1", "p2_2"],
    "description": "Advanced orchestration and GitOps implementation.",
    "tech_stack": ["Kubernetes", "ArgoCD"],
    "complexity": 5
  },
  {
    "id": "p2_4",
    "title": "SOC-in-a-Box",
    "level": 2,
    "status": "locked",
    "category": "Security",
    "position": { "x": 850, "y": 300 },
    "dependencies": ["p2_1"],
    "description": "Security monitoring and threat detection.",
    "tech_stack": ["ELK", "Wazuh"],
    "complexity": 4
  },
  {
    "id": "p3_1",
    "title": "Multi-Cloud K8s",
    "level": 3,
    "status": "locked",
    "category": "Cloud",
    "position": { "x": 350, "y": 500 },
    "dependencies": ["p2_3"],
    "description": "Cluster federation and service mesh.",
    "tech_stack": ["Rancher", "Istio"],
    "complexity": 5
  },
  {
    "id": "p3_2",
    "title": "Zero Trust Network",
    "level": 3,
    "status": "locked",
    "category": "Security",
    "position": { "x": 600, "y": 500 },
    "dependencies": ["p2_4"],
    "description": "Modern security architecture without classic VPNs.",
    "tech_stack": ["BeyondCorp", "WireGuard"],
    "complexity": 4
  },
  {
    "id": "p4_1",
    "title": "Smart Factory (Capstone)",
    "level": 4,
    "status": "locked",
    "category": "Expert",
    "position": { "x": 475, "y": 700 },
    "dependencies": ["p3_1", "p3_2"],
    "description": "The Final Boss: IT + OT Convergence.",
    "tech_stack": ["NSX-T", "IoT", "5G"],
    "complexity": 5
  }
];

export const RANKS: Rank[] = [
  { id: 'novice', title: 'Script Kiddie', minXP: 0, icon: 'Star', color: 'text-slate-500' },
  { id: 'apprentice', title: 'Code Monkey', minXP: 1000, icon: 'Award', color: 'text-emerald-500' },
  { id: 'journeyman', title: 'Full Stack Dev', minXP: 3000, icon: 'Zap', color: 'text-ocean-500' },
  { id: 'expert', title: 'Tech Lead', minXP: 8000, icon: 'Medal', color: 'text-purple-500' },
  { id: 'master', title: 'SysAdmin Wizard', minXP: 15000, icon: 'Crown', color: 'text-amber-500' },
  { id: 'legend', title: '10x Engineer', minXP: 30000, icon: 'Trophy', color: 'text-red-500' },
];

export const BADGES: Badge[] = [
  // General Progression
  { id: 'b_first_step', title: 'Hello World', description: 'Complete your first project.', icon: 'Flag', conditionType: 'project_count', threshold: 1 },
  { id: 'b_builder', title: 'Builder', description: 'Complete 3 projects.', icon: 'Hammer', conditionType: 'project_count', threshold: 3 },
  { id: 'b_architect', title: 'Architect', description: 'Complete 10 projects.', icon: 'Building', conditionType: 'project_count', threshold: 10 },
  
  // Time Grinding
  { id: 'b_grinder', title: 'Grinder', description: 'Log 10 hours of focus.', icon: 'Clock', conditionType: 'hour_count', threshold: 10 },
  { id: 'b_master', title: 'Flow Master', description: 'Log 50 hours of focus.', icon: 'Zap', conditionType: 'hour_count', threshold: 50 },
  
  // Categories
  { id: 'b_net_eng', title: 'Net Admin', description: 'Complete 2 Network projects.', icon: 'Network', conditionType: 'category_count', conditionDetail: 'Network', threshold: 2 },
  { id: 'b_cloud_arch', title: 'Cloud Native', description: 'Complete 3 Cloud projects.', icon: 'Cloud', conditionType: 'category_count', conditionDetail: 'Cloud', threshold: 3 },
  { id: 'b_security', title: 'White Hat', description: 'Complete 2 Security projects.', icon: 'Shield', conditionType: 'category_count', conditionDetail: 'Security', threshold: 2 },
  
  // Tech Stacks
  { id: 'b_py_snake', title: 'Snake Charmer', description: 'Use Python in 3 projects.', icon: 'Code', conditionType: 'tech_stack', conditionDetail: 'Python', threshold: 3 },
  { id: 'b_k8s_captain', title: 'Helmsman', description: 'Deploy 2 Kubernetes projects.', icon: 'Anchor', conditionType: 'tech_stack', conditionDetail: 'Kubernetes', threshold: 2 },
];
