import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsExample() {
  const [value, setValue] = useState("overview");
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Project sections">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">An overview of your project.</TabsContent>
        <TabsContent value="reports">Reports are not available yet.</TabsContent>
        <TabsContent value="activity">Recent project activity.</TabsContent>
      </Tabs>
      <Tabs value={value} onValueChange={setValue} orientation="vertical" activationMode="manual">
        <TabsList variant="line" aria-label="Account sections">
          <TabsTrigger value="overview">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Your profile details.</TabsContent>
        <TabsContent value="settings">Your account settings.</TabsContent>
      </Tabs>
    </div>
  );
}
