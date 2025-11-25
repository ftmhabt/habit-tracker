import { getDashboardData } from "@/actions/dashboard";
import AnimatedHeader from "@/components/dashboard/AnimatedHeader";
import HabitTable from "@/components/dashboard/HabitTable";

export default async function DashboardPage() {
  const { name, habits } = await getDashboardData();

  return (
    <main className="min-h-screen bg-background p-7 space-y-8">
      <AnimatedHeader name={name} />

      {habits.length > 0 ? (
        <HabitTable habits={habits} />
      ) : (
        <p className="text-muted-foreground text-center py-8">
          No habits yet. Create one from onboarding!
        </p>
      )}
    </main>
  );
}
