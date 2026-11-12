import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const howEvsWork: EvArticle = {
  slug: "how-evs-work",
  title: L("How EVs work", "ইভি কীভাবে কাজ করে"),
  summary: L(
    "From the plug to the wheels: the battery, the inverter and motor, regenerative braking and the parts that keep it all at the right temperature.",
    "প্লাগ থেকে চাকা পর্যন্ত: ব্যাটারি, ইনভার্টার ও মোটর, রিজেনারেটিভ ব্রেকিং, আর যেসব যন্ত্রাংশ সবকিছুকে ঠিক তাপমাত্রায় রাখে।",
  ),
  updatedAt: REVIEWED,
  sections: [
    {
      id: "big-picture",
      title: L("The big picture", "পুরো ছবিটা"),
      blocks: [
        {
          type: "p",
          text: L(
            "An EV has far fewer moving parts than a petrol car. Energy comes in from the grid, is stored in the battery, and is turned into motion by an electric motor. When you slow down, some of that energy flows back.",
            "পেট্রোল গাড়ির তুলনায় ইভিতে চলমান যন্ত্রাংশ অনেক কম। শক্তি আসে গ্রিড থেকে, জমা থাকে ব্যাটারিতে, আর বৈদ্যুতিক মোটর তাকে গতিতে রূপ দেয়। গতি কমালে সেই শক্তির কিছুটা আবার ফিরে আসে।",
          ),
        },
        {
          type: "diagram",
          diagram: "drivetrain",
          caption: L(
            "Energy flows from the charger to the battery, through the inverter to the motor and wheels. Braking sends some of it back.",
            "শক্তি চার্জার থেকে ব্যাটারিতে যায়, তারপর ইনভার্টার হয়ে মোটর ও চাকায়। ব্রেক করলে এর কিছুটা ফিরে আসে।",
          ),
        },
      ],
    },
    {
      id: "battery",
      title: L("The battery pack", "ব্যাটারি প্যাক"),
      blocks: [
        {
          type: "p",
          text: L(
            "The traction battery is made of hundreds or thousands of lithium-ion cells, grouped into modules and sealed into a pack under the floor. It works at high voltage, typically several hundred volts. A battery management system (BMS) watches every group of cells, balancing their charge and protecting them from overheating, overcharging and running too low.",
            "চালানোর ব্যাটারি তৈরি হয় শত শত বা হাজার হাজার লিথিয়াম-আয়ন সেল দিয়ে; সেগুলো মডিউলে সাজানো থাকে, আর পুরোটা মেঝের নিচে একটি সিল করা প্যাকে। এটি উচ্চ ভোল্টেজে কাজ করে, সাধারণত কয়েকশো ভোল্টে। ব্যাটারি ম্যানেজমেন্ট সিস্টেম (বিএমএস) প্রতিটি সেল-গুচ্ছের ওপর নজর রাখে, চার্জের ভারসাম্য রাখে, আর অতিরিক্ত গরম, অতিরিক্ত চার্জ বা একেবারে খালি হয়ে যাওয়া থেকে রক্ষা করে।",
          ),
        },
      ],
    },
    {
      id: "motor",
      title: L("Inverter and motor", "ইনভার্টার ও মোটর"),
      blocks: [
        {
          type: "p",
          text: L(
            "The battery stores direct current (DC). The inverter converts it into alternating current at exactly the frequency the motor needs, which is how the car controls speed and pulling power. Because an electric motor delivers strong torque from a standstill, most EVs need only a single fixed gear: no clutch and no gear changes.",
            "ব্যাটারিতে জমা থাকে ডাইরেক্ট কারেন্ট (ডিসি)। ইনভার্টার একে মোটরের প্রয়োজনমতো কম্পাঙ্কের অল্টারনেটিং কারেন্টে বদলে দেয়, আর এভাবেই গাড়ি গতি ও শক্তি নিয়ন্ত্রণ করে। থেমে থাকা অবস্থা থেকেই বৈদ্যুতিক মোটর জোরালো টর্ক দেয়, তাই বেশিরভাগ ইভিতে একটিমাত্র নির্দিষ্ট গিয়ার থাকে: ক্লাচ নেই, গিয়ার বদলানোও নেই।",
          ),
        },
        {
          type: "p",
          text: L(
            "Electric motors are very efficient: they turn most of the battery's energy into motion. A petrol engine, by contrast, loses much of its fuel's energy as heat. That difference is a big part of why an EV usually costs less per kilometre.",
            "বৈদ্যুতিক মোটর খুবই দক্ষ: ব্যাটারির শক্তির বেশিরভাগটাই গতিতে রূপ নেয়। অন্যদিকে পেট্রোল ইঞ্জিনে জ্বালানির শক্তির বড় অংশ তাপ হয়ে নষ্ট হয়। প্রতি কিলোমিটারে ইভির খরচ সাধারণত কম হওয়ার বড় কারণ এটাই।",
          ),
        },
      ],
    },
    {
      id: "regen",
      title: L("Regenerative braking", "রিজেনারেটিভ ব্রেকিং"),
      blocks: [
        {
          type: "p",
          text: L(
            "When you lift off the accelerator or press the brake, the motor runs in reverse as a generator. It slows the car and sends energy back into the battery. In city traffic this recovers a useful share of energy and saves wear on the brake pads. The normal friction brakes are always there for hard stops.",
            "অ্যাক্সিলারেটর ছাড়লে বা ব্রেক চাপলে মোটর উল্টোভাবে জেনারেটর হিসেবে কাজ করে। এতে গাড়ির গতি কমে, আর শক্তি ফিরে যায় ব্যাটারিতে। শহরের যানজটে এভাবে কাজের মতো শক্তি ফেরত আসে, ব্রেক প্যাডও কম ক্ষয় হয়। জোরে থামার জন্য সাধারণ ব্রেক সব সময়ই থাকে।",
          ),
        },
      ],
    },
    {
      id: "charging-hardware",
      title: L("Charging hardware", "চার্জিংয়ের যন্ত্রাংশ"),
      blocks: [
        {
          type: "p",
          text: L(
            "Electricity from the grid is alternating current (AC), but the battery needs DC. For AC charging, the car's own on-board charger does the conversion, and its size limits how fast AC charging can go. A DC fast charger does the conversion inside the charging station and feeds DC straight to the battery, which is why it is so much quicker.",
            "গ্রিডের বিদ্যুৎ অল্টারনেটিং কারেন্ট (এসি), কিন্তু ব্যাটারির দরকার ডিসি। এসি চার্জিংয়ে গাড়ির ভেতরের অন-বোর্ড চার্জার এই রূপান্তর করে, আর এর ক্ষমতাই ঠিক করে এসি চার্জিং কত দ্রুত হবে। ডিসি ফাস্ট চার্জার রূপান্তরটা চার্জিং স্টেশনের ভেতরেই করে সরাসরি ব্যাটারিতে ডিসি দেয়, তাই এটি এত দ্রুত।",
          ),
        },
        {
          type: "p",
          text: L(
            "EVs also have a normal 12-volt battery that runs the lights, locks, screens and computers, just like any car.",
            "যেকোনো গাড়ির মতোই ইভিতেও একটি সাধারণ ১২ ভোল্টের ব্যাটারি থাকে, যা বাতি, লক, স্ক্রিন আর কম্পিউটারগুলো চালায়।",
          ),
        },
      ],
    },
    {
      id: "thermal",
      title: L("Keeping cool", "ঠান্ডা রাখার ব্যবস্থা"),
      blocks: [
        {
          type: "p",
          text: L(
            "Batteries work best in a comfortable temperature range. Most EVs use liquid cooling (some use air) to keep the battery, motor and electronics there, and may run the cooling while parked or charging. In a hot climate like ours, a well-designed thermal system matters for both performance and battery life.",
            "ব্যাটারি সবচেয়ে ভালো কাজ করে আরামদায়ক তাপমাত্রায়। বেশিরভাগ ইভি ব্যাটারি, মোটর আর ইলেকট্রনিকসকে সেই তাপমাত্রায় রাখতে তরল কুলিং ব্যবহার করে (কিছু গাড়িতে বাতাসের কুলিং), আর পার্ক করা বা চার্জ দেওয়ার সময়ও কুলিং চালু রাখতে পারে। আমাদের মতো গরম আবহাওয়ায় পারফরম্যান্স আর ব্যাটারির আয়ু, দুটোর জন্যই ভালো থার্মাল সিস্টেম জরুরি।",
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("Do EVs have a gearbox?", "ইভিতে কি গিয়ারবক্স থাকে?"),
      a: L(
        "Most have a single-speed reduction gear instead of a multi-speed gearbox, so there is no clutch and no gear changing.",
        "বেশিরভাগ ইভিতে বহু-গতির গিয়ারবক্সের বদলে একটিমাত্র রিডাকশন গিয়ার থাকে, তাই ক্লাচ বা গিয়ার বদলানোর ঝামেলা নেই।",
      ),
    },
    {
      q: L("What happens if the battery runs out?", "ব্যাটারি একেবারে শেষ হয়ে গেলে কী হয়?"),
      a: L(
        "The car warns you well in advance and usually limits power as charge gets low. If it does run flat, it needs to be charged where it is or towed to a charger, so it's worth planning ahead on long trips.",
        "অনেক আগে থেকেই গাড়ি সতর্ক করে, আর চার্জ কমে এলে সাধারণত শক্তি সীমিত করে দেয়। পুরোপুরি শেষ হয়ে গেলে সেখানেই চার্জ দিতে হয় বা চার্জার পর্যন্ত টেনে নিতে হয়, তাই লম্বা যাত্রায় আগে থেকে পরিকল্পনা করা ভালো।",
      ),
    },
    {
      q: L("Is the high-voltage system safe?", "উচ্চ ভোল্টেজের সিস্টেম কি নিরাপদ?"),
      a: L(
        "Yes, in normal use. High-voltage parts are sealed, insulated and marked with orange cables, and the system disconnects itself in a crash. Only trained technicians should ever work on them.",
        "সাধারণ ব্যবহারে হ্যাঁ। উচ্চ ভোল্টেজের যন্ত্রাংশ সিল করা, ইনসুলেটেড আর কমলা রঙের তার দিয়ে চিহ্নিত থাকে; দুর্ঘটনায় সিস্টেম নিজে থেকেই সংযোগ বিচ্ছিন্ন করে। এগুলোতে শুধু প্রশিক্ষিত টেকনিশিয়ানেরই কাজ করা উচিত।",
      ),
    },
  ],
  related: ["battery-technology", "charging", "what-is-an-ev"],
};
