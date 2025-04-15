"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  consultationSchema,
  ConsultationFormData,
} from "@/schemas/consultation";
import { useQuery, useMutation } from "react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

interface Patient {
  _id: string;
  telephone: string;
  firstName: string;
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export default function AddConsultationPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: patients, isLoading } = useQuery(["patients"], async () => {
    if (!session?.user) {
      throw new Error("Utilisateur non authentifié");
    }
    const user = session.user as SessionUser;
    const response = await axios.get(`/api/patients?user=${user.id}`);
    return response.data.roles;
  });
  console.log("data", patients);
  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      dateConsultation: new Date(),
      ordonnance: "",
      commentaire: "",
      dosage: "",
      dateRendezVous: null,
    },
  });

  const { mutate: createConsultation, isLoading: isSubmitting } = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      if (!session?.user) {
        throw new Error("Utilisateur non authentifié");
      }
      const user = session.user as SessionUser;
      const consultationData = {
        ...data,
        doctorId: user.id,
        dateConsultation: data.dateConsultation.toISOString(),
        dateRendezVous: data.dateRendezVous?.toISOString() || null,
      };
      console.log("Données à envoyer:", consultationData);
      return axios.post("/api/consultations", consultationData);
    },
    onSuccess: () => {
      toast.success("Consultation créée avec succès");
      router.push("/dashboard/consultations");
    },
    onError: (error: any) => {
      console.error("Erreur détaillée:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Erreur lors de la création de la consultation");
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    console.log("Données du formulaire:", data);
    createConsultation(data);
  };
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Nouvelle Consultation</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoading
                            ? "Chargement..."
                            : "Sélectionner un patient"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Chargement...
                      </SelectItem>
                    ) : patients?.length > 0 ? (
                      patients.map((patient: Patient) => (
                        <SelectItem key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.telephone}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        Aucun patient trouvé
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateConsultation"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de consultation</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ordonnance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordonnance</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Détails de l'ordonnance..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dosage</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Détails du dosage..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commentaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commentaire</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Commentaires..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateRendezVous"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date du prochain rendez-vous</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Enregistrer</Button>
        </form>
      </Form>
    </div>
  );
}
