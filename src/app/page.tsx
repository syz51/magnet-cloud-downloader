import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Cloud, Download, Shield } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Magnet <span className="text-primary">Cloud</span> Downloader
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
              A powerful cloud-based magnet link downloader with secure
              authentication
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="min-w-[160px]">
              <Link href="/sign-in">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-w-[160px]"
            >
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group transition-shadow hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Download className="text-primary h-6 w-6" />
              </div>
              <CardTitle>Download Manager</CardTitle>
              <CardDescription>
                Efficiently manage your magnet link downloads with our
                cloud-based solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="ghost"
                className="group-hover:bg-primary/5 w-full"
              >
                <Link href="/dashboard">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-shadow hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                Magic link authentication ensures your account stays secure
                without passwords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="ghost"
                className="group-hover:bg-primary/5 w-full"
              >
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group transition-shadow hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Cloud className="text-primary h-6 w-6" />
              </div>
              <CardTitle>Cloud Storage</CardTitle>
              <CardDescription>
                Your downloads are safely stored in the cloud, accessible from
                anywhere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="ghost"
                className="group-hover:bg-primary/5 w-full"
              >
                <Link href="/sign-in">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
