import { BattleScene } from "@/components/rpg/BattleScene";

export default async function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-900">
      <BattleScene battleId={id} />
    </div>
  );
}
