import { Link } from "react-router-dom";

function BreadCrumb({ items }) {
    return (
        <nav aria-label="breadcrumb" className="text-sm text-gray-500 mb-4">
            <ol className="flex items-center space-x-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {item.to ? (
                            <Link to={item.to} className="hover:text-indigo-600 transition">
                                {item.label}
                            </Link>
                        ) : (
                            <span>{item.label}</span>
                        )}
                        {index < items.length - 1 && (
                            <span className="mx-1 text-gray-400">/</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

export default BreadCrumb;
