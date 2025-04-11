import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  DollarSign,
  LineChart,
  PieChart,
  Wallet,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Take control of your <span className="text-white">finances</span>
          </h1>
          <p className="text-lg text-gray-200 max-w-lg">
            Track expenses, manage budgets, and gain valuable insights into your
            spending habits with our easy-to-use expense tracker.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              size="lg"
              asChild
              className="bg-yellow-300 text-black hover:bg-yellow-400"
            >
              <Link href="/login">
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {/* <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button> */}
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-accent rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
            <Card className="w-full border-2 border-muted relative bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-primary" />
                  Monthly Overview
                </CardTitle>
                <CardDescription>
                  Your financial summary for July
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-sm">
                      Income
                    </span>
                    <span className="text-2xl font-semibold text-foreground flex items-center">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                      3,240.00
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-sm">
                      Expenses
                    </span>
                    <span className="text-2xl font-semibold text-foreground flex items-center">
                      <CreditCard className="h-5 w-5 text-red-500" />
                      2,108.50
                    </span>
                  </div>
                </div>
                <div className="h-[120px] w-full bg-muted/50 rounded-md flex items-center justify-center">
                  <LineChart className="h-16 w-16 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-accent py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Why Choose Our Expense Tracker?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you manage your finances
              with ease and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-primary" />}
              title="Expense Analytics"
              description="Gain valuable insights with comprehensive charts and reports that break down your spending habits."
            />

            <FeatureCard
              icon={<Wallet className="h-10 w-10 text-primary" />}
              title="Budget Management"
              description="Create and manage budgets for different categories to keep your spending in check."
            />

            <FeatureCard
              icon={<PieChart className="h-10 w-10 text-primary" />}
              title="Category Tracking"
              description="Automatically categorize your expenses and see where your money is going at a glance."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have transformed their financial
              habits.
            </p>
          </div>

          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="tab1">Sarah K.</TabsTrigger>
              <TabsTrigger value="tab2">Michael T.</TabsTrigger>
              <TabsTrigger value="tab3">Jennifer L.</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-6">
              <TestimonialCard
                quote="This app has completely changed how I manage my finances. I've saved over $300 in the first month just by being more aware of my spending habits."
                author="Sarah K."
                role="Small Business Owner"
              />
            </TabsContent>
            <TabsContent value="tab2" className="mt-6">
              <TestimonialCard
                quote="As someone who travels frequently for work, keeping track of expenses was a nightmare. This app makes it so easy to categorize and report everything."
                author="Michael T."
                role="Marketing Consultant"
              />
            </TabsContent>
            <TabsContent value="tab3" className="mt-6">
              <TestimonialCard
                quote="The visual reports helped me identify spending patterns I wasn't aware of. I've finally been able to start saving for my dream vacation!"
                author="Jennifer L."
                role="Healthcare Professional"
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-primary text-primary-foreground py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-primary-foreground/90">
            Join thousands of users who have transformed their financial habits
            with our powerful yet simple expense tracking tools.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              Login <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-background to-muted/20 py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-primary mr-2" />
              <span className="font-semibold text-foreground">
                Expense Tracker
              </span>
            </div>
            {/* <div className="mt-4 md:mt-0">
              <nav className="flex gap-6">
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </nav>
            </div> */}
          </div>
          <div className="mt-6 text-center text-sm text-white">
            © {new Date().getFullYear()} Expense Tracker. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

// Testimonial Card Component
const TestimonialCard = ({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) => {
  return (
    <Card className="text-center max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <p className="text-lg italic mb-6">&quot;{quote}&quot;</p>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
};
