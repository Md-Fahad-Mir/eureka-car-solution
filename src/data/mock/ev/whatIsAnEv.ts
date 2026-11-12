import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const whatIsAnEv: EvArticle = {
  slug: "what-is-an-ev",
  title: L("What is an electric vehicle?", "ইলেকট্রিক গাড়ি আসলে কী?"),
  summary: L(
    "The plain-language basics: what makes a car electric, the different kinds of electrified vehicles, and what driving one is really like.",
    "সহজ ভাষায় মূল কথা: কোন গাড়িকে ইলেকট্রিক বলা হয়, বিদ্যুৎচালিত গাড়ির ধরনগুলো কী, আর চালাতে আসলে কেমন লাগে।",
  ),
  updatedAt: REVIEWED,
  sections: [
    {
      id: "basics",
      title: L("The basics", "মূল কথা"),
      blocks: [
        {
          type: "p",
          text: L(
            "An electric vehicle (EV) is driven by one or more electric motors that draw power from a rechargeable battery. Instead of filling a tank, you plug it in. There is no engine, no exhaust pipe and no gearbox in the usual sense.",
            "ইলেকট্রিক গাড়ি (ইভি) চলে এক বা একাধিক বৈদ্যুতিক মোটরে, যেগুলো শক্তি নেয় রিচার্জযোগ্য ব্যাটারি থেকে। ট্যাংকে তেল ভরার বদলে গাড়িতে চার্জার লাগাতে হয়। এতে কোনো ইঞ্জিন নেই, এক্সজস্ট পাইপ নেই, আর প্রচলিত অর্থে গিয়ারবক্সও নেই।",
          ),
        },
        {
          type: "p",
          text: L(
            "People often use \"EV\" loosely for anything with a battery. It helps to know the main types, because each is charged, driven and maintained a little differently.",
            "ব্যাটারি আছে এমন যেকোনো গাড়িকেই অনেকে \"ইভি\" বলে ফেলেন। কিন্তু মূল ধরনগুলো জানা থাকলে সুবিধা, কারণ প্রতিটির চার্জ দেওয়া, চালানো আর রক্ষণাবেক্ষণ কিছুটা আলাদা।",
          ),
        },
      ],
    },
    {
      id: "types",
      title: L("Types of electrified vehicles", "বিদ্যুৎচালিত গাড়ির ধরন"),
      blocks: [
        {
          type: "list",
          items: [
            L(
              "Battery electric (BEV): runs only on electricity from its battery, and you plug it in to charge. This is what we mean by \"EV\" in these guides.",
              "ব্যাটারি ইলেকট্রিক (বিইভি): শুধু ব্যাটারির বিদ্যুতে চলে, চার্জ দিতে প্লাগ লাগাতে হয়। এই গাইডগুলোতে \"ইভি\" বলতে আমরা এটাকেই বোঝাচ্ছি।",
            ),
            L(
              "Plug-in hybrid (PHEV): a smaller battery for everyday electric driving, plus a petrol engine for longer trips. You get the most from it by plugging in often.",
              "প্লাগ-ইন হাইব্রিড (পিএইচইভি): প্রতিদিনের ছোট যাত্রার জন্য ছোট একটি ব্যাটারি, আর লম্বা যাত্রার জন্য পেট্রোল ইঞ্জিন। নিয়মিত চার্জ দিলে তবেই এর পুরো সুবিধা পাওয়া যায়।",
            ),
            L(
              "Hybrid (HEV): a petrol engine helped by a small battery that recharges itself as you drive and brake. There is no plug.",
              "হাইব্রিড (এইচইভি): পেট্রোল ইঞ্জিনের সঙ্গে ছোট একটি ব্যাটারি, যা চলতে চলতে আর ব্রেক করার সময় নিজে থেকেই চার্জ হয়। এতে প্লাগ নেই।",
            ),
            L(
              "Mild hybrid: a small electric boost for the engine. It cannot drive on electricity alone.",
              "মাইল্ড হাইব্রিড: ইঞ্জিনকে সামান্য বৈদ্যুতিক সহায়তা দেয়, শুধু বিদ্যুতে চলতে পারে না।",
            ),
          ],
        },
        {
          type: "diagram",
          diagram: "powertrainSpectrum",
          caption: L("From petrol to fully electric: how much of the work the battery does.", "পেট্রোল থেকে পুরোপুরি ইলেকট্রিক: কাজের কতটা ব্যাটারি করে।"),
        },
        {
          type: "callout",
          tone: "tip",
          text: L(
            "Fuel-cell cars, which make their own electricity from hydrogen, are electric too. They need hydrogen filling stations, which are not generally available, so these guides focus on battery EVs.",
            "ফুয়েল-সেল গাড়িও ইলেকট্রিক; এগুলো হাইড্রোজেন থেকে নিজেই বিদ্যুৎ তৈরি করে। তবে এর জন্য হাইড্রোজেন স্টেশন লাগে, যা সাধারণত পাওয়া যায় না। তাই এই গাইডগুলো ব্যাটারিচালিত ইভি নিয়েই।",
          ),
        },
      ],
    },
    {
      id: "driving",
      title: L("What driving one is like", "চালাতে কেমন লাগে"),
      blocks: [
        {
          type: "p",
          text: L(
            "The first thing most people notice is the quiet. The second is the response: an electric motor delivers its pulling power the moment you press the pedal, so pulling out into traffic feels effortless. There are no gear changes, just one smooth surge.",
            "প্রথমেই চোখে পড়ে নীরবতা। এরপর টের পাওয়া যায় সাড়া দেওয়ার গতি: প্যাডেলে চাপ দেওয়ামাত্র বৈদ্যুতিক মোটর পুরো শক্তি দেয়, তাই ভিড়ের রাস্তায় এগিয়ে যাওয়া খুব সহজ লাগে। গিয়ার বদলানোর ঝাঁকুনি নেই, শুধু একটানা মসৃণ গতি।",
          ),
        },
        {
          type: "p",
          text: L(
            "When you lift off the accelerator, many EVs slow down noticeably as the motor turns motion back into electricity (regenerative braking). In stop-and-go traffic you will use the brake pedal much less. The heavy battery sits low in the floor, which makes the car feel planted in corners.",
            "অ্যাক্সিলারেটর ছাড়লে অনেক ইভি বেশ খানিকটা গতি কমিয়ে দেয়, কারণ মোটর তখন চলার শক্তিকে আবার বিদ্যুতে রূপান্তর করে (রিজেনারেটিভ ব্রেকিং)। থেমে থেমে চলা যানজটে ব্রেক প্যাডেল অনেক কম লাগে। ভারী ব্যাটারি মেঝের নিচে নিচু করে বসানো থাকে, তাই বাঁক নেওয়ার সময় গাড়ি স্থির লাগে।",
          ),
        },
      ],
    },
    {
      id: "right-for-you",
      title: L("Is an EV right for you?", "ইভি কি আপনার জন্য ঠিক?"),
      blocks: [
        {
          type: "p",
          text: L("A few honest questions decide most of it:", "কয়েকটি সৎ প্রশ্নের উত্তরেই বেশিরভাগ সিদ্ধান্ত হয়ে যায়:"),
        },
        {
          type: "list",
          items: [
            L("Do you have somewhere to charge regularly, at home or at work?", "বাসায় বা অফিসে নিয়মিত চার্জ দেওয়ার জায়গা আছে কি?"),
            L("How far do you drive on a normal day, and how often do you make long trips?", "সাধারণ একটা দিনে কতটা পথ চালান, আর লম্বা যাত্রা কত ঘন ঘন হয়?"),
            L("Are there chargers along the routes you use most?", "যে পথে বেশি যাতায়াত করেন, সেখানে চার্জার আছে কি?"),
            L("How long do you plan to keep the car? Savings on running costs add up over the years.", "গাড়িটি কত বছর রাখবেন? চালানোর খরচের সাশ্রয় বছরের পর বছর জমতে থাকে।"),
          ],
        },
        {
          type: "callout",
          tone: "tip",
          text: L(
            "Put your own numbers into the savings calculator to compare an EV with petrol, diesel or hybrid models for your driving.",
            "নিজের হিসাব বসিয়ে সাশ্রয় ক্যালকুলেটরে দেখুন, আপনার চালানোর ধরনে ইভি আর পেট্রোল, ডিজেল বা হাইব্রিডের মধ্যে পার্থক্য কতটা।",
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("Does an EV need any petrol?", "ইভিতে কি পেট্রোল লাগে?"),
      a: L(
        "A battery EV never uses petrol. Plug-in hybrids and hybrids still have a petrol engine and need fuel.",
        "ব্যাটারি ইভিতে কখনো পেট্রোল লাগে না। প্লাগ-ইন হাইব্রিড আর হাইব্রিডে পেট্রোল ইঞ্জিন থাকে, তাই জ্বালানি লাগে।",
      ),
    },
    {
      q: L("Is a hybrid an EV?", "হাইব্রিড কি ইভি?"),
      a: L(
        "Not in the usual sense. A regular hybrid can't be plugged in and gets all its energy from petrol; the battery only helps the engine work more efficiently.",
        "সাধারণ অর্থে নয়। সাধারণ হাইব্রিডে প্লাগ লাগানো যায় না, পুরো শক্তি আসে পেট্রোল থেকে; ব্যাটারি শুধু ইঞ্জিনকে আরও দক্ষভাবে চলতে সাহায্য করে।",
      ),
    },
    {
      q: L("Can I charge an EV at home?", "বাসায় কি ইভি চার্জ দেওয়া যায়?"),
      a: L(
        "Most EVs can charge from a suitable home socket or a wall box. Have a licensed electrician check your wiring first; our Bangladesh ownership guide explains the steps.",
        "বেশিরভাগ ইভি উপযুক্ত ঘরোয়া সকেট বা ওয়াল বক্স থেকে চার্জ নিতে পারে। আগে একজন লাইসেন্সধারী ইলেকট্রিশিয়ান দিয়ে ওয়্যারিং পরীক্ষা করিয়ে নিন; আমাদের বাংলাদেশে ইভি মালিকানার গাইডে ধাপগুলো বলা আছে।",
      ),
    },
  ],
  related: ["how-evs-work", "compare-powertrains", "ownership-guide-bangladesh"],
};
