import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const ownershipGuideBangladesh: EvArticle = {
  slug: "ownership-guide-bangladesh",
  title: L("Owning an EV in Bangladesh", "বাংলাদেশে ইভির মালিকানা"),
  summary: L(
    "A practical guide: what to check before you buy, setting up home charging, power cuts, heat and monsoon, longer trips and finding the right service.",
    "ব্যবহারিক গাইড: কেনার আগে কী দেখবেন, বাসায় চার্জিংয়ের ব্যবস্থা, লোডশেডিং, গরম ও বর্ষা, লম্বা যাত্রা আর সঠিক সার্ভিস খুঁজে পাওয়া।",
  ),
  updatedAt: REVIEWED,
  cta: "testDrive",
  sections: [
    {
      id: "before-you-buy",
      title: L("Before you buy", "কেনার আগে"),
      blocks: [
        {
          type: "list",
          items: [
            L("Decide where the car will charge every night: at home, in your building's parking or at work.", "গাড়ি প্রতি রাতে কোথায় চার্জ হবে ঠিক করুন: বাসায়, ভবনের পার্কিংয়ে নাকি অফিসে।"),
            L("Check which charging connector the model uses, and whether chargers you'd rely on support it.", "মডেলটির চার্জিং কানেক্টর কোনটি, আর যেসব চার্জারের ওপর নির্ভর করবেন সেগুলো তা সমর্থন করে কি না, দেখে নিন।"),
            L("For reconditioned or used imports, ask for a battery health report, check what warranty applies here, and confirm that parts and software support are available locally.", "রিকন্ডিশন্ড বা পুরোনো আমদানি গাড়ির ক্ষেত্রে ব্যাটারি হেলথ রিপোর্ট চেয়ে নিন, এখানে কোন ওয়ারেন্টি প্রযোজ্য তা দেখুন, আর দেশে যন্ত্রাংশ ও সফটওয়্যার সহায়তা পাওয়া যায় কি না নিশ্চিত হোন।"),
            L("Compare running costs for your own driving in the savings calculator.", "নিজের চালানোর ধরনে চালানোর খরচ সাশ্রয় ক্যালকুলেটরে তুলনা করুন।"),
            L("Registration, tax, duty and insurance rules for EVs can change. Check the current rules before you commit, or ask our team for the latest.", "ইভির রেজিস্ট্রেশন, কর, শুল্ক ও বিমার নিয়ম বদলাতে পারে। সিদ্ধান্তের আগে বর্তমান নিয়ম মিলিয়ে নিন, অথবা সর্বশেষ তথ্যের জন্য আমাদের টিমকে জিজ্ঞেস করুন।"),
          ],
        },
      ],
    },
    {
      id: "home-charging",
      title: L("Setting up home charging", "বাসায় চার্জিংয়ের ব্যবস্থা"),
      blocks: [
        {
          type: "list",
          items: [
            L("Have a licensed electrician inspect your wiring and fit a dedicated circuit with proper earthing and protection (an RCD or RCBO).", "লাইসেন্সধারী ইলেকট্রিশিয়ান দিয়ে ওয়্যারিং পরীক্ষা করিয়ে সঠিক আর্থিং ও সুরক্ষাসহ (আরসিডি বা আরসিবিও) আলাদা সার্কিট বসান।"),
            L("Check your connection's sanctioned load with your electricity distribution company. A 7 kW wall box may need a higher sanctioned load.", "আপনার বিদ্যুৎ বিতরণ কোম্পানির সঙ্গে সংযোগের অনুমোদিত লোড মিলিয়ে নিন। ৭ কিলোওয়াটের ওয়াল বক্সের জন্য বেশি অনুমোদিত লোড লাগতে পারে।"),
            L("In an apartment building, agree with the building committee or owners' association on charging in your parking space and on how the electricity will be metered and paid for.", "অ্যাপার্টমেন্ট ভবনে নিজের পার্কিংয়ে চার্জ দেওয়া, আর বিদ্যুৎ কীভাবে মাপা ও পরিশোধ হবে, তা নিয়ে ভবন কমিটি বা মালিক সমিতির সঙ্গে একমত হোন।"),
            L("Use certified charging equipment and never an extension cord.", "সার্টিফায়েড চার্জিং যন্ত্র ব্যবহার করুন, কখনো এক্সটেনশন কর্ড নয়।"),
          ],
        },
        {
          type: "callout",
          tone: "local",
          text: L(
            "Requirements and approvals differ between buildings and distribution companies. Check current local regulations and prices before installing.",
            "ভবন আর বিতরণ কোম্পানিভেদে শর্ত ও অনুমোদন আলাদা। বসানোর আগে বর্তমান স্থানীয় নিয়ম ও দাম মিলিয়ে নিন।",
          ),
        },
      ],
    },
    {
      id: "power-cuts",
      title: L("Load-shedding and backup power", "লোডশেডিং ও ব্যাকআপ বিদ্যুৎ"),
      blocks: [
        {
          type: "p",
          text: L(
            "An EV doesn't need to charge every night, and most lose little charge while parked, so an occasional power cut is rarely a problem. Charge when power is available, typically overnight, and keep a sensible buffer.",
            "ইভিকে প্রতি রাতে চার্জ দিতে হয় না, আর পার্ক করা অবস্থায় বেশিরভাগ গাড়ি খুব সামান্য চার্জ হারায়, তাই মাঝেমধ্যে লোডশেডিং সাধারণত সমস্যা নয়। বিদ্যুৎ থাকলে চার্জ দিন, সাধারণত রাতে, আর হাতে যুক্তিসংগত পরিমাণ চার্জ রাখুন।",
          ),
        },
        {
          type: "callout",
          tone: "caution",
          text: L(
            "Don't charge from an IPS, inverter backup or generator unless the equipment is rated for the load. A household IPS is not designed to run an EV charger.",
            "যন্ত্রটি লোডের উপযোগী না হলে আইপিএস, ইনভার্টার ব্যাকআপ বা জেনারেটর থেকে চার্জ দেবেন না। বাসার আইপিএস ইভি চার্জার চালানোর জন্য তৈরি নয়।",
          ),
        },
      ],
    },
    {
      id: "heat-and-monsoon",
      title: L("Heat and the monsoon", "গরম আর বর্ষা"),
      blocks: [
        {
          type: "list",
          items: [
            L("Park in the shade or under cover; heat is the main thing that ages a battery.", "ছায়ায় বা ছাউনির নিচে পার্ক করুন; ব্যাটারি পুরোনো হওয়ার প্রধান কারণ তাপ।"),
            L("If your car allows it, cool the cabin while it's still plugged in, using grid power instead of the battery.", "গাড়িতে সুবিধা থাকলে প্লাগ লাগানো অবস্থাতেই কেবিন ঠান্ডা করে নিন, ব্যাটারির বদলে গ্রিডের বিদ্যুতে।"),
            L("Battery packs are sealed, but avoid driving through deep water. Check the wading depth in your owner's manual, and if in doubt, wait or take another route.", "ব্যাটারি প্যাক সিল করা, তবু গভীর পানির মধ্য দিয়ে চালাবেন না। মালিকের ম্যানুয়ালে কতটা পানিতে চালানো যায় দেখে নিন; সন্দেহ হলে অপেক্ষা করুন বা অন্য পথে যান।"),
            L("Never charge if the socket, cable or charger has been in water.", "সকেট, তার বা চার্জার পানিতে ডুবে থাকলে কখনো চার্জ দেবেন না।"),
          ],
        },
      ],
    },
    {
      id: "longer-trips",
      title: L("Planning longer trips", "লম্বা যাত্রার পরিকল্পনা"),
      blocks: [
        {
          type: "list",
          items: [
            L("Before you set off, check public chargers along your route and whether they support your connector. Availability is growing but still limited in many areas.", "রওনা দেওয়ার আগে পথে পাবলিক চার্জার আছে কি না, আর সেগুলো আপনার কানেক্টর সমর্থন করে কি না দেখে নিন। চার্জার বাড়ছে, তবে অনেক এলাকায় এখনো সীমিত।"),
            L("Keep a buffer of around 20% rather than planning to arrive nearly empty.", "প্রায় খালি অবস্থায় পৌঁছানোর পরিকল্পনা না করে প্রায় ২০% চার্জ হাতে রাখুন।"),
            L("Highway speeds and air-conditioning use more energy than city driving.", "শহরের চেয়ে মহাসড়কের গতি আর এসিতে বেশি শক্তি খরচ হয়।"),
            L("Have a backup plan, such as a hotel or a relative's home where you can charge on AC overnight.", "বিকল্প পরিকল্পনা রাখুন, যেমন এমন কোনো হোটেল বা আত্মীয়ের বাসা, যেখানে রাতে এসিতে চার্জ দেওয়া যাবে।"),
          ],
        },
      ],
    },
    {
      id: "servicing",
      title: L("Service and support", "সার্ভিস ও সহায়তা"),
      blocks: [
        {
          type: "p",
          text: L(
            "Choose a workshop with EV-trained technicians and the diagnostic tools for your brand, and ask about parts availability before you buy. Eureka's service centres offer an EV battery health check alongside regular servicing.",
            "এমন ওয়ার্কশপ বেছে নিন, যেখানে ইভি-প্রশিক্ষিত টেকনিশিয়ান আর আপনার ব্র্যান্ডের ডায়াগনস্টিক যন্ত্র আছে, আর কেনার আগেই যন্ত্রাংশ পাওয়া যায় কি না জেনে নিন। ইউরেকার সার্ভিস সেন্টারে নিয়মিত সার্ভিসের পাশাপাশি ইভি ব্যাটারি হেলথ চেকও হয়।",
          ),
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("Can I install a charger in my apartment's parking?", "অ্যাপার্টমেন্টের পার্কিংয়ে কি চার্জার বসানো যায়?"),
      a: L(
        "Often, yes, with the agreement of your building committee or owners' association and a safe, properly metered supply installed by a licensed electrician.",
        "প্রায়ই যায়, ভবন কমিটি বা মালিক সমিতির সম্মতি আর লাইসেন্সধারী ইলেকট্রিশিয়ান দিয়ে বসানো নিরাপদ ও সঠিকভাবে মাপা বিদ্যুৎ সংযোগ থাকলে।",
      ),
    },
    {
      q: L("What about power cuts?", "লোডশেডিং হলে কী হবে?"),
      a: L(
        "Most owners simply charge whenever power is available. Since a typical day's driving uses only part of the battery, a missed night rarely matters.",
        "বেশিরভাগ মালিক বিদ্যুৎ থাকলেই চার্জ দিয়ে নেন। সাধারণ এক দিনের চালানোয় ব্যাটারির অল্প অংশই খরচ হয়, তাই এক রাত চার্জ না হলে সাধারণত সমস্যা হয় না।",
      ),
    },
    {
      q: L("Are there public chargers in Bangladesh?", "বাংলাদেশে কি পাবলিক চার্জার আছে?"),
      a: L(
        "Public charging is growing but still limited in many areas. Check current maps and operators before relying on a route, and confirm they support your car's connector.",
        "পাবলিক চার্জিং বাড়ছে, তবে অনেক এলাকায় এখনো সীমিত। কোনো পথের ওপর নির্ভর করার আগে বর্তমান ম্যাপ ও অপারেটর দেখে নিন, আর আপনার গাড়ির কানেক্টর সমর্থন করে কি না নিশ্চিত হোন।",
      ),
    },
    {
      q: L("Do EVs get special registration or tax treatment?", "ইভির রেজিস্ট্রেশন বা করে কি বিশেষ সুবিধা আছে?"),
      a: L(
        "Rules for registration, duty and tax can change, so we don't quote them here. Check the current rules with the relevant authorities, or ask our team for the latest information.",
        "রেজিস্ট্রেশন, শুল্ক ও করের নিয়ম বদলাতে পারে, তাই আমরা এখানে তা উল্লেখ করছি না। সংশ্লিষ্ট কর্তৃপক্ষের কাছ থেকে বর্তমান নিয়ম জেনে নিন, অথবা সর্বশেষ তথ্যের জন্য আমাদের টিমকে জিজ্ঞেস করুন।",
      ),
    },
  ],
  related: ["charging", "benefits-and-limitations", "battery-technology"],
};
