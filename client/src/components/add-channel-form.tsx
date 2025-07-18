import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const formSchema = z.object({
  channelUrl: z.string().url("Please enter a valid URL").refine(
    (url) => url.includes("youtube.com") || url.includes("youtu.be"), 
    "Please enter a valid YouTube channel URL"
  ),
});

type FormData = z.infer<typeof formSchema>;

export function AddChannelForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelUrl: "",
    },
  });

  const addChannelMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/channels", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      form.reset();
      toast({
        title: "Channel added",
        description: "The channel has been added and videos are being fetched automatically.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add channel. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    addChannelMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <Card className="bg-card border border-border">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-medium mb-2">Add YouTube Channel</h2>
            <p className="text-muted-foreground text-sm">
              Add your favorite creators to build your curated collection
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="channelUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Paste YouTube channel URL here..."
                        className="bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:border-primary text-center"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={addChannelMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium"
              >
                {addChannelMutation.isPending ? "Adding Channel..." : "Add Channel"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}