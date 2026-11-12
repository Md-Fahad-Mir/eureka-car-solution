import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const maintenance: EvArticle = {
  slug: "maintenance",
  title: L("EV maintenance", "ইভির রক্ষণাবেক্ষণ"),
  summary: L(
    "What an EV no longer needs, what it still does, how to keep an eye on battery health, and why trained technicians matter.",
    "ইভিতে কী আর লাগে না, কী এখনো লাগে, ব্যাটারির অবস্থার দিকে কীভাবে নজর রাখবেন, আর প্রশিক্ষিত টেকনিশিয়ান কেন জরুরি।",
  ),
  updatedAt: REVIEWED,
  cta: "service",
  sections: [
    {
      id: "gone",
      title: L("What you no longer need", "যা আর লাগে না"),
      blocks: [
        {
          type: "p",
          text: L("With no engine, a whole list of routine jobs disappears:", "ইঞ্জিন না থাকায় নিয়মিত কাজের লম্বা একটা তালিকা আর লাগে না:"),
        },
        {
          type: "list",
          items: [
            L("Engine oil and oil filter changes", "ইঞ্জিন অয়েল ও অয়েল ফিল্টার বদল"),
            L("Spark plugs, timing belts and fuel filters", "স্পার্ক প্লাগ, টাইমিং বেল্ট আর ফুয়েল ফিল্টার"),
            L("Clutch wear and exhaust repairs", "ক্লাচের ক্ষয় আর এক্সজস্ট মেরামত"),
          ],
        },
      ],
    },
    {
      id: "still-needed",
      title: L("What still needs care", "যার যত্ন এখনো লাগে"),
      blocks: [
        {
          type: "list",
          items: [
            L("Tyres: EVs are heavy and deliver strong torque, so tyres can wear faster. Check pressures often and rotate them as recommended.", "টায়ার: ইভি ভারী আর জোরালো টর্ক দেয়, তাই টায়ার দ্রুত ক্ষয় হতে পারে। নিয়মিত প্রেশার দেখুন, আর পরামর্শমতো টায়ার ঘুরিয়ে লাগান।"),
            L("Brakes: regenerative braking means pads last longer, but brake fluid still ages, and brakes that are rarely used hard can corrode. They still need regular checks.", "ব্রেক: রিজেনারেটিভ ব্রেকিংয়ের কারণে প্যাড বেশি দিন টেকে, কিন্তু ব্রেক ফ্লুইড পুরোনো হয়, আর কম ব্যবহৃত ব্রেকে মরিচা ধরতে পারে। নিয়মিত পরীক্ষা তাই জরুরি।"),
            L("Coolant for the battery and motor cooling system, at the intervals in your manual.", "ব্যাটারি ও মোটরের কুলিং সিস্টেমের কুল্যান্ট, ম্যানুয়ালে দেওয়া সময় অনুযায়ী।"),
            L("The 12-volt battery, cabin air filter, wipers, lights, suspension and steering.", "১২ ভোল্টের ব্যাটারি, কেবিন এয়ার ফিল্টার, ওয়াইপার, বাতি, সাসপেনশন আর স্টিয়ারিং।"),
            L("Software updates, which can improve charging, range and features.", "সফটওয়্যার আপডেট, যা চার্জিং, রেঞ্জ আর ফিচার উন্নত করতে পারে।"),
          ],
        },
      ],
    },
    {
      id: "battery-health",
      title: L("Keeping an eye on battery health", "ব্যাটারির অবস্থার দিকে নজর"),
      blocks: [
        {
          type: "p",
          text: L(
            "A yearly battery health check reads the pack's state of health, checks the cooling system and looks for cell imbalance. It's especially worthwhile before buying or selling a used EV.",
            "বছরে একবার ব্যাটারি হেলথ চেকে প্যাকের স্টেট অব হেলথ দেখা হয়, কুলিং সিস্টেম পরীক্ষা করা হয়, আর সেলগুলোর মধ্যে ভারসাম্যহীনতা খোঁজা হয়। পুরোনো ইভি কেনা বা বেচার আগে এটি বিশেষভাবে কাজের।",
          ),
        },
      ],
    },
    {
      id: "high-voltage",
      title: L("Why trained technicians matter", "প্রশিক্ষিত টেকনিশিয়ান কেন জরুরি"),
      blocks: [
        {
          type: "callout",
          tone: "caution",
          text: L(
            "The high-voltage system, marked by orange cables, can be dangerous to anyone without the right training and equipment. Choose a workshop with EV-trained technicians and the diagnostic tools for your brand.",
            "কমলা তার দিয়ে চিহ্নিত উচ্চ ভোল্টেজের সিস্টেম সঠিক প্রশিক্ষণ ও যন্ত্রপাতি ছাড়া যে কারও জন্য বিপজ্জনক হতে পারে। এমন ওয়ার্কশপ বেছে নিন, যেখানে ইভি-প্রশিক্ষিত টেকনিশিয়ান আর আপনার ব্র্যান্ডের ডায়াগনস্টিক যন্ত্র আছে।",
          ),
        },
      ],
    },
    {
      id: "schedule",
      title: L("How often to service", "কত দিন পরপর সার্ভিস"),
      blocks: [
        {
          type: "p",
          text: L(
            "Your manufacturer's schedule comes first. As a general guide, many EVs are inspected about once a year or every 15,000 km or so. Our service page lists intervals by fuel type and the packages that cover them.",
            "নির্মাতার সূচিই আগে। সাধারণ নির্দেশনা হিসেবে অনেক ইভি বছরে একবার বা মোটামুটি প্রতি ১৫,০০০ কিমিতে পরীক্ষা করানো হয়। আমাদের সার্ভিস পেজে জ্বালানির ধরন অনুযায়ী সময় আর সংশ্লিষ্ট প্যাকেজের তালিকা আছে।",
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("Is servicing an EV cheaper?", "ইভির সার্ভিসিং কি সস্তা?"),
      a: L(
        "Usually there are fewer routine items, so regular servicing tends to cost less than for a petrol or diesel car. Tyres, brakes and repairs still cost money, and specialist work can be more expensive.",
        "সাধারণত নিয়মিত কাজ কম, তাই পেট্রোল বা ডিজেল গাড়ির চেয়ে নিয়মিত সার্ভিসিংয়ে খরচ কম হয়। তবে টায়ার, ব্রেক আর মেরামতে খরচ আছে, আর বিশেষায়িত কাজে খরচ বেশিও হতে পারে।",
      ),
    },
    {
      q: L("Do EV tyres wear out faster?", "ইভির টায়ার কি দ্রুত ক্ষয় হয়?"),
      a: L(
        "They can, because of the extra weight and instant torque. Correct pressures, regular rotation and smooth driving make a real difference.",
        "হতে পারে, বাড়তি ওজন আর তাৎক্ষণিক টর্কের কারণে। সঠিক প্রেশার, নিয়মিত টায়ার ঘোরানো আর মসৃণভাবে চালানো সত্যিই পার্থক্য গড়ে।",
      ),
    },
    {
      q: L("Can any garage service an EV?", "যেকোনো গ্যারেজ কি ইভি সার্ভিস করতে পারে?"),
      a: L(
        "Tyres, wipers and similar jobs, yes. Anything involving the high-voltage system should only be done by EV-trained technicians.",
        "টায়ার, ওয়াইপার বা এমন কাজ পারে। উচ্চ ভোল্টেজের সিস্টেম সংক্রান্ত যেকোনো কাজ শুধু ইভি-প্রশিক্ষিত টেকনিশিয়ানেরই করা উচিত।",
      ),
    },
  ],
  related: ["battery-technology", "benefits-and-limitations", "ownership-guide-bangladesh"],
};
