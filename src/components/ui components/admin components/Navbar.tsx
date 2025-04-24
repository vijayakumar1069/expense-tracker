"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "motion/react";
import { Wallet, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useTransition } from "react";
import { NavItem } from "@/utils/types";
import { adminNavbarValues } from "@/utils/constants/consts";
import { logoutFunction } from "@/app/(auth)/login/__actions/authActions";
import { toast } from "sonner";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const [isPending, startTransition] = useTransition();

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const linkRef = useRef<null | HTMLLIElement>(null);

    useEffect(() => {
      if (linkRef.current) {
        linkRef.current.style.transform = isActive ? "scale(1.05)" : "scale(1)";
      }
    }, [isActive]);

    return (
      <li ref={linkRef} className="relative">
        <Link
          href={item.href}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300
            ${
              isActive
                ? "bg-gradient-to-r from-primary to-[#8b5cf6] text-white shadow-lg shadow-primary/20"
                : "hover:bg-bills/50 hover:text-accent-foreground"
            }
          `}
        >
          <item.icon
            className={`w-5 h-5 ${isActive ? "text-white" : "text-primary"}`}
          />
          <span
            className={`font-medium ${
              isActive ? "text-white" : "text-foreground"
            }`}
          >
            {item.title}
          </span>
          {isActive && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22c55e] to-[#0ea5e9] rounded-full" />
          )}
        </Link>
      </li>
    );
  };
  const handleLogout = () => {
    startTransition(async () => {
      const res = await logoutFunction();
      toast.loading("Logging out...", {
        duration: 10000,
        position: "top-center",
        id: "logout-toast",
      });
      if (res.success) {
        toast.success("logged out successfully", {
          duration: 2000,
          position: "top-center",
          id: "logout-toast",
        });
        // Add these two lines:
        window.location.href = "/login";
        window.location.reload();
      } else {
        toast.error("Failed to log out", {
          duration: 2000,
          position: "top-center",
          id: "logout-toast",
        });
      }
    });
  };
  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-background/5 via-background/10 to-background/1 shadow-accent-foreground/10 shadow-md border-b border-border/40 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link href={"/dashboard"}>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary via-[#8b5cf6] to-[#0ea5e9]">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-[#8b5cf6] to-[#0ea5e9] bg-clip-text text-transparent">
                Expense Tracker
              </h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <motion.ul
            className="hidden md:flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {adminNavbarValues.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </motion.ul>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-primary/10"
                >
                  <Menu className="w-6 h-6 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[80vw] sm:w-[350px] bg-gradient-to-b from-background to-accent border-l border-border/40"
              >
                <div className="flex flex-col gap-8 mt-7">
                  {/* <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-white to-white bg-clip-text text-transparent">
                    Navigation
                  </h2> */}
                  <nav className="flex flex-col gap-3">
                    {adminNavbarValues.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                          ${
                            pathname === item.href
                              ? "bg-gradient-to-r from-primary to-[#8b5cf6] text-white shadow-lg shadow-primary/20"
                              : "hover:bg-accent"
                          }
                        `}
                      >
                        <item.icon
                          className={`w-5 h-5 ${
                            pathname === item.href
                              ? "text-white"
                              : "text-accent"
                          }`}
                        />
                        <span
                          className={
                            pathname === item.href
                              ? "text-white"
                              : "text-green-50"
                          }
                        >
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </nav>
                  <Button
                    onClick={handleLogout}
                    disabled={isPending}
                    variant="destructive"
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-destructive to-[#ef4444] hover:opacity-90 transition-opacity"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logout Button */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              onClick={handleLogout}
              disabled={isPending}
              variant="destructive"
              size="lg"
              className="gap-2 cursor-pointer bg-gradient-to-r from-destructive to-[#ef4444] hover:opacity-90 transition-opacity"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
