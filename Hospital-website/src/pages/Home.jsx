import Hero from '../components/Hero';
import { departments } from '../data/department';
import { doctors } from '../data/doctors';
import DoctorCard from '../components/DoctorCard';
import { motion } from 'framer-motion';
import { Shield, Users, Zap, Heart, ArrowRight, Quote, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Zap, title: '24/7 Emergency', desc: 'Round-the-clock emergency medical services with rapid response teams.' },
  { icon: Users, title: 'Qualified Doctors', desc: 'Expert medical professionals with years of experience in various fields.' },
  { icon: Shield, title: 'Advanced Tech', desc: 'Equipped with the latest medical technology for precise diagnosis.' },
  { icon: Heart, title: 'Patient Care', desc: 'Compassionate care focused on patient comfort and recovery.' },
];
const accents = [
  "from-blue-500 to-blue-300",
  "from-green-500 to-green-300",
  "from-purple-500 to-purple-300",
  "from-red-500 to-red-300"
];

const testimonials = [
  { name: 'John Smith', role: 'Patient', text: 'The care I received was exceptional. The doctors and staff were professional and caring throughout my recovery.' },
  { name: 'Sarah Williams', role: 'Patient', text: 'State-of-the-art facilities and very knowledgeable doctors. Highly recommended.' },
  { name: 'Michael Brown', role: 'Patient', text: 'Booking was seamless. The pediatric team is wonderful. Truly a world-class hospital.' },
  { name: 'Anjali Reddy', role: 'Patient', text: 'Doctors explained everything clearly and treatment was excellent.' },
  { name: 'Rahul Kumar', role: 'Patient', text: 'Very clean hospital with friendly staff and quick service.' },
  { name: 'Priya Sharma', role: 'Patient', text: 'Highly satisfied with the care and attention provided.' },
];


export default function Home() {
  return (
    <div className="space-y-28 pb-24">

      <Hero />

      {/* Emergency CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-red-600 rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-red-600/30"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-4">
              <span className="relative flex h-5 w-5 md:h-6 md:w-6">
                <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-40"></span>
                <span className="relative rounded-full h-5 w-5 md:h-6 md:w-6 bg-white"></span>
              </span>
              24/7 Emergency Service Available
            </h2>
            <p className="text-red-100 text-lg max-w-2xl">
              Rapid response teams and life support ambulances ready for critical situations.
            </p>
          </div>

          <a
            href="tel:+2347060671574"
            className="bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-red-50 hover:scale-105 transition-all shadow-lg"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative bg-white hover:bg-blue-50/30 rounded-3xl p-6 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >

              {/* 🔥 Gradient Top Accent */}
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accents[i]} rounded-t-3xl`}
              ></div>

              {/* Icon */}
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.desc}
              </p>

            </div>
          ))}

        </div>
      </section>

      {/* Departments */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div className="flex flex-col items-center text-center mb-12 w-full">
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
                Specialists In
              </h2>

              <p className="text-slate-600 max-w-xl mx-auto">
                Explore our specialized medical experts equipped with advanced care.
              </p>
            </div>
          </div>

          {/* 🔥 ADD THIS HERE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {departments.slice(0, 6).map((dept) => (
              <Link to={`/departments/${dept.id}`} key={dept.id}>
                <div className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden group">

                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition"
                  />

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {dept.title}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {dept.description}
                    </p>
                  </div>

                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/departments"
              className="inline-flex items-center px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 hover:scale-105 transition"
            >
              View All Departments
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Specialists</h2>
          <p className="text-slate-600">Our expert doctors provide the best care.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.slice(0, 4).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/doctors"
            className="inline-flex items-center px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 hover:scale-105 transition"
          >
            View All Doctors <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/*  CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Schedule Your Visit?
          </h2>
          <p className="text-xl mb-10">
            Book your appointment with our expert team today.
          </p>

          <Link
            to="/appointment"
            className="inline-flex px-10 py-4 bg-white text-blue-600 rounded-full font-bold hover:scale-105 transition shadow-xl"
          >
            Book Appointment Now
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Patients Say
            </h2>
          </div>

          {/* 🔥 SCROLL WRAPPER */}
          <div className="overflow-hidden">

            <div className="flex gap-8 animate-scroll">

              {[...testimonials, ...testimonials].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="min-w-[320px] max-w-[320px] p-8 bg-slate-50 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition"
                >
                  <Quote className="mb-4 text-blue-600/20" />
                  <p className="italic mb-6">"{t.text}"</p>
                  <h4 className="font-bold">{t.name}</h4>
                  <p className="text-sm text-blue-600">{t.role}</p>
                </motion.div>
              ))}

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}