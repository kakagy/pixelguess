import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    title: "Daily Challenge",
    description: "One new pixel art puzzle every day at midnight.",
  },
  {
    title: "Progressive Reveal",
    description: "6 rounds. Image gets clearer each round. How early can you guess?",
  },
  {
    title: "Share & Compete",
    description: "Share your emoji result grid with friends on social media.",
  },
];

export function Features() {
  return (
    <section className="grid md:grid-cols-3 gap-4 px-4 py-12 max-w-4xl mx-auto">
      {features.map((f) => (
        <Card key={f.title} className="bg-card/50">
          <CardHeader>
            <CardTitle className="font-mono">{f.title}</CardTitle>
            <CardDescription className="font-mono">{f.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </section>
  );
}
