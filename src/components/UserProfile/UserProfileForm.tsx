
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserProfile } from "@/types/userProfile";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.number().min(13).max(120),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(300),
});

export function UserProfileForm() {
  const { setUserProfile, userProfile } = useUserProfile();
  const [open, setOpen] = React.useState(false);

  // Create defaultValues object with non-optional values using type assertions
  const defaultValues = {
    name: userProfile?.name || "",
    age: userProfile?.age || 25,
    height: userProfile?.height || 170,
    weight: userProfile?.weight || 70,
  } as UserProfile;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setUserProfile(values);
    setOpen(false);
    toast.success("Profile updated successfully!");
  }

  return (
    <div className="flex flex-col items-center">
      {userProfile && (
        <div className="mb-4 text-center">
          <Avatar className="h-24 w-24 mx-auto mb-2">
            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-medium">{userProfile.name}</h2>
          <div className="text-sm text-muted-foreground">
            Age: {userProfile.age} | Height: {userProfile.height}cm | Weight: {userProfile.weight}kg
          </div>
          <div className="mt-4 border rounded-md p-4 max-w-md mx-auto">
            <h3 className="font-medium mb-2">Conversation</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-2 rounded-md flex-1">
                  <p className="text-sm">Hi {userProfile.name}, how are you feeling today?</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-primary text-primary-foreground p-2 rounded-md flex-1">
                  <p className="text-sm">I'm feeling great! Ready for my workout session.</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="bg-muted p-2 rounded-md flex-1">
                  <p className="text-sm">Great! Let's tailor your workout to your height of {userProfile.height}cm and weight of {userProfile.weight}kg.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Your age" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Height in cm" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Weight in kg" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Save Profile</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
