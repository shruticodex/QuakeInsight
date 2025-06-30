import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">QuakeInsight</h3>
            <p className="text-sm">Real-Time Earthquake Analysis with Machine Learning</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Quick Links</h3>
            <ul className="text-sm space-y-1">
              {["Home", "Research", "Recent Earthquakes", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-300">Contact Us</h3>
            <p className="text-sm">Email: quakeinsight@gmail.com</p>
            <p className="text-sm">Phone: +1 (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm">
          <p>&copy; 2023 QuakeInsight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

