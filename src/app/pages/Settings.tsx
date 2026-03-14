import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { 
  Bell, 
  Shield, 
  Smartphone, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Save,
  User,
  Camera,
  Edit
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { getAutoSMSSimulationEnabled, setAutoSMSSimulationEnabled } from "../lib/smsSimulator";

export function Settings() {
  const [userName, setUserName] = useState("John Doe");
  const [userPhone, setUserPhone] = useState(localStorage.getItem("userPhone") || "+1 (555) 000-0000");
  const [profilePic, setProfilePic] = useState("");
  const [balanceThreshold, setBalanceThreshold] = useState(500);
  const [weeklyBudget, setWeeklyBudget] = useState(600);
  const [monthlyBudget, setMonthlyBudget] = useState(2500);
  const [notifications, setNotifications] = useState({
    lowBalance: true,
    spending: true,
    appUsage: true,
    monthlyReport: true,
    encouragement: true,
  });
  const [spendingAlertSensitivity, setSpendingAlertSensitivity] = useState([70]);
  const [autoSMSDemoEnabled, setAutoSMSDemoEnabled] = useState(() => getAutoSMSSimulationEnabled());

  const handleSave = () => {
    localStorage.setItem("userName", userName);
    toast.success("Settings Saved", {
      description: "Your preferences have been updated successfully.",
      duration: 3000,
    });
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Customize your SpenTrack experience</p>
        </div>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>
              Customize your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userName.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="profile-pic-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 mb-1">Profile Picture</p>
                <p className="text-sm text-slate-500">
                  Click the camera icon to update your photo
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <div className="relative">
                <Edit className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            {/* Phone Number (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone Number</Label>
              <Input
                id="user-phone"
                type="tel"
                value={userPhone}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">
                Phone number can't be changed. Contact support if needed.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Balance & Budget Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <CardTitle>Balance & Budget</CardTitle>
            </div>
            <CardDescription>
              Set your financial thresholds and budgets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="balance-threshold">
                Low Balance Threshold
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <Input
                    id="balance-threshold"
                    type="number"
                    value={balanceThreshold}
                    onChange={(e) => setBalanceThreshold(Number(e.target.value))}
                    className="pl-7"
                  />
                </div>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-slate-500">
                You'll be notified when your balance falls below this amount
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly-budget">Weekly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  id="weekly-budget"
                  type="number"
                  value={weeklyBudget}
                  onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-budget">Monthly Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  id="monthly-budget"
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="pl-7"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Balance Alerts</Label>
                <p className="text-sm text-slate-500">
                  Get notified when your balance is low
                </p>
              </div>
              <Switch
                checked={notifications.lowBalance}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, lowBalance: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Spending Warnings</Label>
                <p className="text-sm text-slate-500">
                  Reminders before making purchases
                </p>
              </div>
              <Switch
                checked={notifications.spending}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, spending: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>App Usage Alerts</Label>
                <p className="text-sm text-slate-500">
                  Notifications when opening high-spend apps
                </p>
              </div>
              <Switch
                checked={notifications.appUsage}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, appUsage: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Monthly Reports</Label>
                <p className="text-sm text-slate-500">
                  Monthly spending wrap-up and insights
                </p>
              </div>
              <Switch
                checked={notifications.monthlyReport}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, monthlyReport: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Encouragement Messages</Label>
                <p className="text-sm text-slate-500">
                  Positive reinforcement when you save
                </p>
              </div>
              <Switch
                checked={notifications.encouragement}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, encouragement: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Monitoring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <CardTitle>Smart Monitoring</CardTitle>
            </div>
            <CardDescription>
              Adaptive alerts based on your spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Spending Alert Sensitivity</Label>
                <span className="text-sm font-medium text-slate-900">
                  {spendingAlertSensitivity[0]}%
                </span>
              </div>
              <Slider
                value={spendingAlertSensitivity}
                onValueChange={setSpendingAlertSensitivity}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-slate-500">
                Alert me when I've used {spendingAlertSensitivity[0]}% of my budget
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Adaptive Learning Enabled</p>
                  <p className="text-sm text-purple-700 mt-1">
                    SpenTrack learns from your spending patterns and adjusts warnings dynamically to help you build better financial habits.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SMS Integration (Mock) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-600" />
              <CardTitle>SMS Transaction Tracking</CardTitle>
            </div>
            <CardDescription>
              Analyze bank SMS notifications for real-time tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="font-medium text-teal-900">SMS Permissions Granted</p>
                  <p className="text-sm text-teal-700 mt-1">
                    SpenTrack can read your bank SMS notifications to track transactions in real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Connected Bank</Label>
              <Input value="Chase Bank ••••1234" disabled />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div className="pr-4">
                <p className="font-medium text-slate-900">Automatic SMS demo feed</p>
                <p className="text-sm text-slate-500 mt-1">
                  Generate realistic spending SMS messages every few seconds so the dashboard updates itself.
                </p>
              </div>
              <Switch
                checked={autoSMSDemoEnabled}
                onCheckedChange={(checked) => {
                  setAutoSMSDemoEnabled(checked);
                  setAutoSMSSimulationEnabled(checked);
                  toast.success(checked ? "Auto SMS demo enabled" : "Auto SMS demo paused", {
                    description: checked
                      ? "New simulated spend messages will start flowing into the app automatically."
                      : "Automatic spending SMS simulation has been turned off.",
                  });
                }}
              />
            </div>

            <Button variant="outline" className="w-full">
              Update SMS Permissions
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <CardTitle>Security & Privacy</CardTitle>
            </div>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                Your financial data is encrypted and stored securely. We never share your information with third parties.
              </p>
            </div>

            <Button variant="outline" className="w-full">
              Change Password
            </Button>

            <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
              Disconnect Bank Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Button 
          onClick={handleSave}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
}