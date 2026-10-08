import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import {
  UserPlus,
  Users,
  LogIn,
  TrendingUp,
  ShieldCheck,
  Box,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

const HomePage = () => {
  const navigate = useNavigate();

  // Animation variants for staggered loading
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Box className="text-white w-6 h-6" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Samph<span className="text-blue-600">arix</span> ERP
            </h1>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="hidden md:flex border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => navigate("/register")}
            >
              Partner with us
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
              onClick={() => navigate("/login")}
            >
              Login to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 inline-block">
              v2.0 Next-Gen Supply Chain
            </span>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
              The Intelligent Way to Manage{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
                Pharma Operations
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect manufacturers, distributors, and retailers on a single,
              AI-powered platform. Automate your billing, track expiries, and
              manage B2B credit seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2"
                onClick={() => navigate("/register")}
              >
                Join the Network <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="bg-white py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">
              Enterprise-Grade Features
            </h2>

            <p className="text-slate-500 mt-3">
              Everything you need to scale your pharmaceutical business.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                icon: Box,
                title: "Multi-Level Network",
                desc: "Seamless stock transfers from manufacturer to distributor to retailer with role-based dynamic margins.",
                color: "text-blue-600",
                bg: "bg-blue-100",
              },
              {
                icon: ShieldCheck,
                title: "Credit Management",
                desc: "B2B ledger handling outstanding balances, custom credit limits, and automated order blocking.",
                color: "text-emerald-600",
                bg: "bg-emerald-100",
              },
              {
                icon: TrendingUp,
                title: "AI Analytics",
                desc: "Predictive inventory modeling, expiry loss prevention, and automated 30/15/7-day alerts.",
                color: "text-indigo-600",
                bg: "bg-indigo-100",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>

                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Selection / Call to Action */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">
            Choose Your Role
          </h2>

          <p className="text-slate-500 mt-3">
            Secure, role-based access for every tier of the supply chain.
          </p>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Distributor Card */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-100 overflow-hidden group">
              <CardContent className="p-10 text-center flex flex-col h-full">
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="text-blue-600 w-10 h-10" />
                </div>

                <h2 className="text-2xl font-bold mb-3">Distributor</h2>

                <p className="text-slate-500 flex-grow mb-8">
                  Supply medicines in bulk, manage retailer credit lines, and
                  track expansive inventory.
                </p>

                <Button
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 py-6 text-lg rounded-xl"
                  onClick={() => navigate("/register")}
                >
                  Apply as Distributor
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Retailer Card */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-100 overflow-hidden group">
              <CardContent className="p-10 text-center flex flex-col h-full">
                <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserPlus className="text-emerald-600 w-10 h-10" />
                </div>

                <h2 className="text-2xl font-bold mb-3">Retailer</h2>

                <p className="text-slate-500 flex-grow mb-8">
                  Purchase from distributors, generate fast GST bills, and
                  manage local store stock.
                </p>

                <Button
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 py-6 text-lg rounded-xl"
                  onClick={() => navigate("/register")}
                >
                  Apply as Retailer
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Login Card */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 group">
              <CardContent className="p-10 text-center flex flex-col h-full">
                <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LogIn className="text-white w-10 h-10" />
                </div>

                <h2 className="text-2xl font-bold mb-3">
                  Already Approved?
                </h2>

                <p className="text-blue-100 flex-grow mb-8">
                  Access your personalized dashboard to manage orders,
                  analytics, and billing.
                </p>

                <Button
                  className="w-full bg-white text-blue-700 hover:bg-slate-100 py-6 text-lg rounded-xl font-bold"
                  onClick={() => navigate("/login")}
                >
                  Login Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Box className="w-6 h-6 text-blue-500" />

          <span className="text-xl font-bold text-white">
            Sampharix ERP
          </span>
        </div>

        <p>© 2026 Sampharix ERP. All rights reserved by Sambit Kumar Swain.</p>
      </footer>
    </div>
  );
};

export default HomePage;