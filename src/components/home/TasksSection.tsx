import TaskCard from "./TaskCard";

// Sample tasks data (will come from database later)
const sampleTasks = [
  {
    id: "1",
    title: "Cacimbo - Um abraço apertado",
    channelName: "Cacimbo Oficial",
    videoId: "vlQghBb2Qkc",
    duration: 180,
    reward: 75.50,
  },
  {
    id: "2",
    title: "Música Angolana 2024",
    channelName: "Angola Music",
    videoId: "skky9WaHtPU",
    duration: 240,
    reward: 110.00,
  },
  {
    id: "3",
    title: "Cacimbo - Pura Emoção",
    channelName: "Cacimbo Oficial",
    videoId: "Jgth2f3PTz4",
    duration: 300,
    reward: 150.25,
  },
  {
    id: "4",
    title: "Kizomba Hits Angola",
    channelName: "Kizomba TV",
    videoId: "sz71Dq65Wbc",
    duration: 150,
    reward: 60.00,
  },
  {
    id: "5",
    title: "Semba Tradicional",
    channelName: "Semba Angola",
    videoId: "ndW9FSOtUG0",
    duration: 200,
    reward: 95.75,
  },
  {
    id: "6",
    title: "Afro House Mix",
    channelName: "Afro Beats AO",
    videoId: "0smKG7cQBJo",
    duration: 280,
    reward: 125.00,
  },
];

const TasksSection = () => {
  return (
    <section id="tasks" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Tarefas <span className="text-gradient">Disponíveis</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escolha um vídeo, assista até o final e receba sua recompensa instantaneamente.
          </p>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              title={task.title}
              channelName={task.channelName}
              videoId={task.videoId}
              duration={task.duration}
              reward={task.reward}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TasksSection;
