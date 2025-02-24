import { BarChart3, Users2, Building2, GraduationCap } from "lucide-react"
import Container from "./container"

const features = [
  {
    icon: BarChart3,
    title: "Market Analysis",
    description: "Deep dive into emerging market trends, opportunities, and challenges through research reports.",
  },
  {
    icon: Users2,
    title: "Networking Events",
    description: "Connect with fellow market analysts and our regular networking events.",
  },
  {
    icon: Building2,
    title: "Corporate Partnerships",
    description: "Gain exposure to leading consulting and international business opportunities.",
  },
  {
    icon: GraduationCap,
    title: "Educational Resources",
    description: "Access exclusive presentations and learning materials about emerging markets.",
  },
]

export default function WhyJoinEmn() {
  return (
    <Container>
        <h2 className="font-candu tracking-loose mb-8 inline-flex rounded-tl-3xl rounded-br-3xl bg-[#6cbe45] px-6 py-2 text-3xl  text-white">
          WHY JOIN EMN
        </h2>
        <p className="font-medium md:text-xl text-foreground/80 mb-5">Discover opportunities to engage in emerging markets while building valuable skils and connections</p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-lg bg-[#f1f1f1] p-6">
            <feature.icon className="mb-4 h-8 w-8 text-[#6cbe45]" />
            <h3 className="mb-2 font-semibold">{feature.title}</h3>
            <p className="text-sm text-foreground/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </Container>
  )
}

