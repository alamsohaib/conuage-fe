
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { PricingPlan, Subscription, UpdateSubscriptionRequest } from "@/lib/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const OrganizationSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<UpdateSubscriptionRequest>();
  
  const selectedPlanId = watch("pricing_plan_id");
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [plansResponse, subscriptionResponse] = await Promise.all([
          api.organization.getPricingPlans(),
          api.organization.getSubscription()
        ]);
        
        if (plansResponse.data) {
          setPricingPlans(plansResponse.data);
        } else if (plansResponse.error) {
          toast.error(plansResponse.error.message || "Failed to load pricing plans");
        }
        
        if (subscriptionResponse.data) {
          setSubscription(subscriptionResponse.data);
          reset({
            pricing_plan_id: subscriptionResponse.data.pricing_plan.id,
            number_of_users_paid: subscriptionResponse.data.number_of_users_paid
          });
        } else if (subscriptionResponse.error) {
          toast.error(subscriptionResponse.error.message || "Failed to load subscription details");
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [reset]);
  
  const onSubmit = async (formData: UpdateSubscriptionRequest) => {
    setIsSaving(true);
    try {
      const { data, error } = await api.organization.updateSubscription(formData);
      if (data) {
        setSubscription(data);
        toast.success("Subscription updated successfully");
      } else if (error) {
        toast.error(error.message || "Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription");
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const selectedPlan = pricingPlans.find(plan => plan.id === selectedPlanId) || subscription?.pricing_plan;
  
  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            View your current plan and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {subscription && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h3 className="font-medium">Plan</h3>
                  <p className="text-lg font-semibold">{subscription.pricing_plan.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Monthly Cost</h3>
                  <p className="text-lg font-semibold">
                    ${subscription.monthly_cost} ({subscription.number_of_users_paid} users)
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Token Limits</h3>
                  <p>Monthly: {subscription.pricing_plan.monthly_token_limit_per_user} per user</p>
                  <p>Daily: {subscription.pricing_plan.daily_token_limit_per_user} per user</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h3 className="font-medium">Start Date</h3>
                  <p>{formatDate(subscription.subscription_start_date)}</p>
                </div>
                <div>
                  <h3 className="font-medium">End Date</h3>
                  <p>{formatDate(subscription.subscription_end_date)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0">
            <CardTitle>Update Subscription</CardTitle>
            <CardDescription>
              Change your plan or adjust the number of users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-0">
            <div className="space-y-2">
              <Label htmlFor="pricing_plan_id">Select Plan</Label>
              <Select 
                onValueChange={value => setValue("pricing_plan_id", value)} 
                defaultValue={subscription?.pricing_plan.id}
              >
                <SelectTrigger id="pricing_plan_id">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {pricingPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (${plan.cost}/month per user)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_users_paid">Number of Users</Label>
              <Input
                id="number_of_users_paid"
                type="number"
                min="1"
                {...register("number_of_users_paid", { 
                  required: "Number of users is required",
                  min: {
                    value: 1,
                    message: "Minimum 1 user required"
                  },
                  valueAsNumber: true
                })}
              />
              {errors.number_of_users_paid && (
                <p className="text-sm text-destructive">{errors.number_of_users_paid.message}</p>
              )}
            </div>
            
            {selectedPlan && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p>{selectedPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Per User</p>
                    <p>${selectedPlan.cost}/month</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Users</p>
                    <p>{watch("number_of_users_paid") || subscription?.number_of_users_paid}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Monthly Cost</p>
                    <p className="font-bold">${(selectedPlan.cost * (Number(watch("number_of_users_paid")) || subscription?.number_of_users_paid || 0)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end px-0 pb-0">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Subscription"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default OrganizationSubscription;
