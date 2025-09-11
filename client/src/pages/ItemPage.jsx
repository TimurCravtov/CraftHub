import ProductCard from "../component/ProductCard.jsx";
import Header from "../component/Header.jsx";

export default function ItemPage() {
    const products = [
        {
            id: 1,
            productName: "Minimalist Table",
            sellerName: "Andrei's Shop",
            price: 20,
            imageUrl: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353",
        },
        {
            id: 2,
            productName: "Handmade Vase",
            sellerName: "Maria Handmade",
            price: 35,
            imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
        },
        {
            id: 3,
            productName: "Wooden Chair",
            sellerName: "Crafts by Ion",
            price: 50,
            imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        productName={product.productName}
                        sellerName={product.sellerName}
                        price={product.price}
                        imageUrl={product.imageUrl}
                    />
                ))}
            </div>
        </div>
    );
}
