

export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 EMN. All rights reserved.</p>
          <nav className="mt-4">
            <a href="/privacy" className="text-blue-400 hover:text-blue-600 mx-2">Privacy Policy</a>
            <a href="/terms" className="text-blue-400 hover:text-blue-600 mx-2">Terms of Service</a>
          </nav>
        </div>
      </footer>
    );
  }