import { useState, useEffect } from "react";
import { Calendar } from "./components/Calendar";
import { ActivityModal } from "./components/ActivityModal";
import { Clock, Calendar as CalendarIcon, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useSupabaseClient } from "./lib/supabase";
import { ThemeToggle } from "./components/ThemeToggle";

interface Activity {
  id?: string;
  description: string;
  hours: number;
  project: string;
}

function App() {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activities, setActivities] = useState<Record<string, Activity>>({});
  const [profissional, setProfissional] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (user) {
      const loadActivities = async () => {
        if (!user) return;
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        try {
          const { data, error } = await supabase
            .from("activities")
            .select("*")
            .eq("userId", user.id)
            .gte("date", start.toISOString())
            .lte("date", end.toISOString());

          if (error) throw error;

          const activitiesMap: Record<string, Activity> = {};
          data.forEach((activity) => {
            activitiesMap[activity.date] = {
              id: activity.id,
              description: activity.description,
              hours: activity.hours,
              project: activity.project,
            };
          });

          setActivities(activitiesMap);
        } catch (error) {
          console.error("Error loading activities:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadActivities();
    }
  }, [user, selectedDate, supabase]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveActivity = async (activity: Activity) => {
    "use server";
    if (!user) return;

    const dateKey = selectedDate.toISOString().split("T")[0];
    const existingActivity = activities[dateKey];

    try {
      if (existingActivity?.id) {
        const { error } = await supabase
          .from("activities")
          .update({
            project: activity.project,
            description: activity.description,
            hours: activity.hours,
          })
          .eq("id", existingActivity.id)
          .eq("userId", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("activities").insert({
          userId: user.id,
          date: dateKey,
          project: activity.project,
          description: activity.description,
          hours: activity.hours,
        });

        if (error) throw error;
      }

      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      const { data, error: loadError } = await supabase
        .from("activities")
        .select("*")
        .eq("userId", user.id)
        .gte("date", start.toISOString())
        .lte("date", end.toISOString());

      if (!loadError && data) {
        const activitiesMap: Record<string, Activity> = {};
        data.forEach((activity) => {
          activitiesMap[activity.date] = {
            id: activity.id,
            description: activity.description,
            hours: activity.hours,
            project: activity.project,
          };
        });
        setActivities(activitiesMap);
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  const totalHours = Object.values(activities).reduce(
    (sum, activity) => sum + activity.hours,
    0,
  );

  const handleExportCSV = () => {
    const headers = [
      "Profissional",
      "Mês/ANO",
      "Descrição da tarefa",
      "dia",
      "horas",
      "Projeto",
    ];
    const csvRows = [headers];

    Object.entries(activities).forEach(([date, activity]) => {
      const [year, month, day] = date.split("-");
      const mesAno = `${month}/${year}`;

      csvRows.push([
        profissional,
        mesAno,
        activity.description.replace(/,/g, ";"),
        day,
        activity.hours.toString(),
        activity.project,
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `atividades_${format(selectedDate, "MMMM_yyyy", {
      locale: ptBR,
    })}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <SignIn />
        </div>
      </SignedOut>

      <SignedIn>
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Relatório de Atividades
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300">
              Gerencie suas atividades diárias e acompanhe suas horas
              trabalhadas
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-[1fr,300px] gap-6">
                <div className="space-y-6">
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    activities={activities}
                  />

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Clock className="w-6 h-6" />
                      Resumo do Mês
                    </h2>
                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-200">
                        Total de Horas Trabalhadas:
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {totalHours}h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6" />
                    Atividades Recentes
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(activities).map(([date, activity]) => (
                      <div
                        key={date}
                        className="border-b dark:border-gray-700 pb-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {date}
                          </span>
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {activity.hours}h
                          </span>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-500 dark:text-gray-400 mb-1">
                            Projeto: {activity.project}
                          </p>
                          <p className="text-gray-700 dark:text-gray-200">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Exportar Relatório
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Nome do Profissional
                    </label>
                    <input
                      type="text"
                      value={profissional}
                      onChange={(e) => setProfissional(e.target.value)}
                      className="w-full max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Digite seu nome"
                    />
                  </div>
                  <button
                    onClick={handleExportCSV}
                    disabled={
                      !profissional || Object.keys(activities).length === 0
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                  >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          onSave={handleSaveActivity}
          currentActivity={activities[selectedDate.toISOString().split("T")[0]]}
        />
      </SignedIn>
    </div>
  );
}

export default App;
