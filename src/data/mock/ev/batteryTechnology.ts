import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const batteryTechnology: EvArticle = {
  slug: "battery-technology",
  title: L("EV battery technology", "ইভির ব্যাটারি প্রযুক্তি"),
  summary: L(
    "What's inside the pack, the two main battery chemistries, what kWh really means, how batteries age, and how to look after yours.",
    "প্যাকের ভেতরে কী আছে, দুটি প্রধান ব্যাটারি রসায়ন, কিলোওয়াট-ঘণ্টা আসলে কী বোঝায়, ব্যাটারি কীভাবে পুরোনো হয়, আর কীভাবে যত্ন নেবেন।",
  ),
  updatedAt: REVIEWED,
  sections: [
    {
      id: "inside",
      title: L("Inside the pack", "প্যাকের ভেতরে"),
      blocks: [
        {
          type: "p",
          text: L(
            "An EV battery is built in layers. Individual lithium-ion cells are grouped into modules, and the modules are assembled into a sealed, protected pack with its own cooling and electronics.",
            "ইভির ব্যাটারি স্তরে স্তরে তৈরি। আলাদা আলাদা লিথিয়াম-আয়ন সেল মিলে মডিউল হয়, আর মডিউলগুলো দিয়ে তৈরি হয় নিজস্ব কুলিং ও ইলেকট্রনিকসসহ একটি সিল করা, সুরক্ষিত প্যাক।",
          ),
        },
        {
          type: "diagram",
          diagram: "batteryPack",
          caption: L("Cells make modules; modules make the pack, managed by the BMS and kept at the right temperature.", "সেল মিলে মডিউল, মডিউল মিলে প্যাক; বিএমএস তা নিয়ন্ত্রণ করে আর ঠিক তাপমাত্রায় রাখে।"),
        },
      ],
    },
    {
      id: "chemistry",
      title: L("NMC and LFP: the two main chemistries", "এনএমসি ও এলএফপি: দুটি প্রধান রসায়ন"),
      blocks: [
        {
          type: "list",
          items: [
            L(
              "NMC (nickel manganese cobalt) stores more energy for its weight, which means more range from a lighter pack.",
              "এনএমসি (নিকেল ম্যাঙ্গানিজ কোবাল্ট) ওজনের তুলনায় বেশি শক্তি ধরে রাখে, তাই হালকা প্যাকেই বেশি রেঞ্জ পাওয়া যায়।",
            ),
            L(
              "LFP (lithium iron phosphate) stores a little less for its weight, but generally lasts more charge cycles, copes better with heat and uses no cobalt.",
              "এলএফপি (লিথিয়াম আয়রন ফসফেট) ওজনের তুলনায় কিছুটা কম শক্তি ধরে, তবে সাধারণত বেশি বার চার্জ-ডিসচার্জ সহ্য করে, গরমে ভালো টেকে, আর এতে কোবাল্ট নেই।",
            ),
          ],
        },
        {
          type: "p",
          text: L(
            "Both are proven and safe in well-engineered cars. The chemistry affects how the manufacturer recommends you charge day to day, so it's worth knowing which one your car uses: ask us, or check the specifications.",
            "ভালোভাবে তৈরি গাড়িতে দুটিই পরীক্ষিত ও নিরাপদ। প্রতিদিন কীভাবে চার্জ দিতে বলা হয়, তা রসায়নের ওপর নির্ভর করে, তাই আপনার গাড়িতে কোনটি আছে জেনে রাখা ভালো: আমাদের জিজ্ঞেস করুন, অথবা স্পেসিফিকেশন দেখুন।",
          ),
        },
      ],
    },
    {
      id: "capacity",
      title: L("Capacity and range", "ক্ষমতা ও রেঞ্জ"),
      blocks: [
        {
          type: "p",
          text: L(
            "Battery size is measured in kilowatt-hours (kWh), the amount of energy it can store. Range is roughly that capacity divided by how much energy the car uses per kilometre. A car using 15 kWh per 100 km with 60 kWh available would go about 400 km.",
            "ব্যাটারির আকার মাপা হয় কিলোওয়াট-ঘণ্টায় (kWh), অর্থাৎ এটি কতটা শক্তি জমা রাখতে পারে। রেঞ্জ মোটামুটি সেই ক্ষমতাকে প্রতি কিলোমিটারের খরচ দিয়ে ভাগ করলে পাওয়া যায়। প্রতি ১০০ কিমিতে ১৫ kWh খরচ হওয়া একটি গাড়ি ৬০ kWh দিয়ে প্রায় ৪০০ কিমি যাবে।",
          ),
        },
        {
          type: "p",
          text: L(
            "Consumption isn't fixed. High speed, heavy air-conditioning use, a full load and hills all increase it, while gentle city driving with regenerative braking reduces it. Treat official range figures as a best case.",
            "খরচ নির্দিষ্ট নয়। বেশি গতি, এসির বেশি ব্যবহার, পুরো বোঝা আর চড়াই সবই খরচ বাড়ায়; আর রিজেনারেটিভ ব্রেকিংসহ ধীরেসুস্থে শহরে চালালে খরচ কমে। অফিসিয়াল রেঞ্জকে সবচেয়ে ভালো অবস্থার হিসাব ধরে নিন।",
          ),
        },
      ],
    },
    {
      id: "ageing",
      title: L("How batteries age", "ব্যাটারি কীভাবে পুরোনো হয়"),
      blocks: [
        {
          type: "p",
          text: L(
            "Like a phone battery, an EV battery slowly loses some capacity over the years. It doesn't suddenly stop working. Its condition is described as state of health (SoH): a pack at 90% SoH holds 90% of what it did when new. Modern packs are designed to age gradually, and the BMS protects them from most abuse.",
            "ফোনের ব্যাটারির মতোই ইভির ব্যাটারিও বছরের পর বছর ধীরে ধীরে কিছু ক্ষমতা হারায়। হঠাৎ করে বন্ধ হয়ে যায় না। এর অবস্থা বোঝানো হয় স্টেট অব হেলথ (এসওএইচ) দিয়ে: ৯০% এসওএইচ মানে নতুন অবস্থার ৯০% শক্তি ধরে রাখতে পারে। আধুনিক প্যাক ধীরে ধীরে পুরোনো হওয়ার মতো করেই তৈরি, আর বিএমএস বেশিরভাগ অযত্ন থেকে রক্ষা করে।",
          ),
        },
        {
          type: "p",
          text: L("A few habits help it last:", "কয়েকটি অভ্যাস ব্যাটারিকে দীর্ঘস্থায়ী করে:"),
        },
        {
          type: "list",
          items: [
            L("Park in the shade or under cover when you can. Heat is the main thing that speeds up ageing.", "সম্ভব হলে ছায়ায় বা ছাউনির নিচে পার্ক করুন। ব্যাটারি দ্রুত পুরোনো হওয়ার প্রধান কারণ তাপ।"),
            L("For everyday charging, follow the limit your manufacturer recommends. Many suggest around 80% for daily use on NMC batteries, while some recommend charging LFP batteries to 100% regularly.", "প্রতিদিনের চার্জে নির্মাতার সুপারিশ করা সীমা মেনে চলুন। অনেকে এনএমসি ব্যাটারিতে প্রতিদিনের জন্য ৮০% এর কাছাকাছি বলেন, আবার কেউ কেউ এলএফপি ব্যাটারি নিয়মিত ১০০% পর্যন্ত চার্জ দিতে বলেন।"),
            L("Avoid leaving the car for long periods almost empty or completely full.", "প্রায় খালি বা একেবারে পুরো চার্জে গাড়ি অনেক দিন ফেলে রাখবেন না।"),
            L("Use DC fast charging when you need it; slower AC charging is gentler for everyday use.", "দরকার হলে ডিসি ফাস্ট চার্জিং করুন; প্রতিদিনের জন্য ধীর এসি চার্জিং ব্যাটারির জন্য বেশি আরামদায়ক।"),
          ],
        },
      ],
    },
    {
      id: "warranty",
      title: L("Warranties and used EVs", "ওয়ারেন্টি ও পুরোনো ইভি"),
      blocks: [
        {
          type: "p",
          text: L(
            "Many manufacturers give the battery its own warranty, often for around eight years or a set distance, usually with a minimum state of health. Terms differ between brands and markets.",
            "অনেক নির্মাতা ব্যাটারির জন্য আলাদা ওয়ারেন্টি দেয়, প্রায়ই আট বছরের কাছাকাছি বা নির্দিষ্ট দূরত্ব পর্যন্ত, সাধারণত একটি ন্যূনতম স্টেট অব হেলথের শর্তে। শর্ত ব্র্যান্ড আর বাজারভেদে আলাদা।",
          ),
        },
        {
          type: "callout",
          tone: "caution",
          text: L(
            "With reconditioned and used imports, the original warranty may not apply in Bangladesh. Ask for a battery health report and check exactly what cover comes with the car before you buy.",
            "রিকন্ডিশন্ড ও পুরোনো আমদানি গাড়ির ক্ষেত্রে মূল ওয়ারেন্টি বাংলাদেশে প্রযোজ্য নাও হতে পারে। কেনার আগে ব্যাটারি হেলথ রিপোর্ট চেয়ে নিন, আর গাড়ির সঙ্গে ঠিক কী সুরক্ষা আসছে তা মিলিয়ে নিন।",
          ),
        },
      ],
    },
    {
      id: "end-of-life",
      title: L("After life in the car", "গাড়ির পরের জীবন"),
      blocks: [
        {
          type: "p",
          text: L(
            "A battery that's no longer ideal for driving can often still store energy for years, for example in stationary storage. At the end, specialist recyclers recover valuable materials such as lithium, nickel and cobalt.",
            "গাড়ি চালানোর জন্য আর আদর্শ নয় এমন ব্যাটারিও প্রায়ই আরও কয়েক বছর শক্তি জমা রাখতে পারে, যেমন স্থির বিদ্যুৎ সংরক্ষণে। শেষে বিশেষায়িত রিসাইক্লাররা লিথিয়াম, নিকেল ও কোবাল্টের মতো মূল্যবান উপাদান উদ্ধার করে।",
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("How long does an EV battery last?", "ইভির ব্যাটারি কত দিন টেকে?"),
      a: L(
        "Usually many years. Capacity falls gradually rather than all at once, and how quickly depends on heat, charging habits and mileage. The battery warranty is a good guide to what the manufacturer expects.",
        "সাধারণত অনেক বছর। ক্ষমতা হঠাৎ নয়, ধীরে ধীরে কমে; কত দ্রুত কমবে তা নির্ভর করে তাপ, চার্জ দেওয়ার অভ্যাস আর কত চালানো হয় তার ওপর। নির্মাতা কী আশা করে, তা বোঝার ভালো উপায় ব্যাটারির ওয়ারেন্টি।",
      ),
    },
    {
      q: L("Does fast charging damage the battery?", "ফাস্ট চার্জিং কি ব্যাটারির ক্ষতি করে?"),
      a: L(
        "Occasional fast charging is what it's designed for. Relying on it every day can add some extra wear over time, which is why slower charging is recommended for daily use.",
        "মাঝে মাঝে ফাস্ট চার্জিংয়ের জন্যই ব্যাটারি তৈরি। তবে প্রতিদিন এর ওপর নির্ভর করলে সময়ের সঙ্গে কিছুটা বাড়তি ক্ষয় হতে পারে, তাই প্রতিদিনের জন্য ধীর চার্জিংয়ের পরামর্শ দেওয়া হয়।",
      ),
    },
    {
      q: L("Can a battery be repaired instead of replaced?", "ব্যাটারি কি বদলানোর বদলে মেরামত করা যায়?"),
      a: L(
        "Sometimes. In many packs, trained technicians can replace a faulty module rather than the whole battery. It depends on the design and on parts being available.",
        "কখনো কখনো। অনেক প্যাকে প্রশিক্ষিত টেকনিশিয়ান পুরো ব্যাটারির বদলে শুধু ত্রুটিপূর্ণ মডিউলটি বদলাতে পারেন। এটা নির্ভর করে নকশা আর যন্ত্রাংশ পাওয়া যায় কি না তার ওপর।",
      ),
    },
  ],
  related: ["charging", "maintenance", "benefits-and-limitations"],
};
