import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
    const categoryImages = {
        'Electronics': 'https://th.bing.com/th/id/R.0770c13569f4bb5c4b6642ec2c4e8fcb?rik=BdUfnCWbVF3qMw&riu=http%3a%2f%2f1.bp.blogspot.com%2f-Dt4zQZIq_U4%2fTvfeRMwptnI%2fAAAAAAAAEOg%2fhp_0XRDmQCY%2fs1600%2fmonkey_5.jpg&ehk=siLundgNms%2bK3A5an9i4sxDAE4XQUmOwdnzF6cdHPrM%3d&risl=&pid=ImgRaw&r=0',
        'default': 'https://images.unsplash.com/photo-1664455340023-214c33a9d0bd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZWNvbW1lcmNlfGVufDB8fDB8fHww'
    };

    return (
        <Link
            to={`/customer/categories/${category.id}`}
            className="relative block rounded-lg overflow-hidden group"
        >
            <div className="h-48 overflow-hidden">
                <img
                    src={categoryImages[category.name] || categoryImages.default}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-white text-2xl font-extrabold tracking-wide text-shadow">
                    {category.name}
                </h3>
            </div>
        </Link>
    );
}