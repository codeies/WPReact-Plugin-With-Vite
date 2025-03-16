import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import StepHeader from "@/components/StepHeader";
//import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCampaignStore from "@/stores/useCampaignStore";
import axios from "axios";

const BillboardStep = () => {
    const {
        billboard,
        setBillboardFilters,
        setCurrentStep,
        setCampaignType
    } = useCampaignStore();

    const [billboards, setBillboards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${adbridgeData.restUrl}adrentals/v1/campaigns?adrentals_type=billboard`)
            .then(response => {
                const formattedBillboards = response.data.map(item => ({
                    id: item.id,
                    name: item.title,
                    acron: item.acron,
                    attributes: item.attributes,
                    featured_image: item.featured_image,
                    category: (item.adrental_category && item.adrental_category[0]) || "Unknown",
                    location: (item.adrental_location && item.adrental_location[0]) || "Unknown",
                    pricing: {
                        daily: item.durations.find(d => d.type === "Daily")?.price || 0,
                        daily_premium: item.durations.find(d => d.type === "Daily Premium")?.price || 0,
                        weekly: item.durations.find(d => d.type === "Weekly")?.price || 0,
                        weekly_premium: item.durations.find(d => d.type === "Weekly Premium")?.price || 0,
                        monthly: item.durations.find(d => d.type === "Monthly")?.price || 0,
                        monthly_premium: item.durations.find(d => d.type === "Monthly Premium")?.price || 0
                    }
                }));
                setBillboards(formattedBillboards);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching billboards:", error);
                setLoading(false);
            });
    }, []);

    const categories = ["all", ...new Set(billboards.flatMap(billboard => billboard.category))];
    const locations = ["all", ...new Set(billboards.flatMap(billboard => billboard.location))];

    const filteredBillboards = billboards.filter((r) => {
        const matchesType = billboard.selectedCategory === "all" || r.category.includes(billboard.selectedCategory);
        const matchesLocation = billboard.selectedLocation === "all" || r.location.includes(billboard.selectedLocation);
        const matchesSearch = billboard.searchTerm ? r.name?.toLowerCase().includes(billboard.searchTerm.toLowerCase()) : true;

        return matchesType && matchesLocation && matchesSearch;
    });


    const handleBack = () => {
        setCurrentStep(1);
        setCampaignType(null);
    };

    return (
        <div className="space-y-6">
            <StepHeader
                title="Select Billboard"
                onBack={handleBack}
            />

            <div className="grid gap-4 mb-6 sm:grid-cols-2 md:flex md:flex-wrap">
                {/* Search Input */}
                <div className="flex-1 min-w-[150px] sm:min-w-[200px]">
                    <Input
                        type="text"
                        placeholder="Search billboards..."
                        value={billboard.searchTerm}
                        onChange={(e) => setBillboardFilters({ searchTerm: e.target.value })}
                        className="w-full"
                    />
                </div>

                {/* Category Filter */}
                <div className="relative z-20 min-w-[130px] sm:min-w-[150px]">
                    <Select
                        value={billboard.selectedCategory}
                        onValueChange={(value) => setBillboardFilters({ selectedCategory: value })}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-full sm:w-48">
                            {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Location Filter */}
                <div className="relative z-20 min-w-[130px] sm:min-w-[150px]">
                    <Select
                        value={billboard.selectedLocation}
                        onValueChange={(value) => setBillboardFilters({ selectedLocation: value })}
                    >
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-full sm:w-48">
                            {locations.map(location => (
                                <SelectItem key={location} value={location}>
                                    {location.charAt(0).toUpperCase() + location.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>


            {loading ? (
                <p>Loading billboards...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBillboards.map((billboard) => (
                        <Card
                            key={billboard.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                                //console.log("Billboard selected:", billboard);
                                setBillboardFilters({ selectedBillboard: billboard });
                                setCurrentStep(3);
                            }}
                        >
                            <CardContent className="p-3 md:p-4">
                                {/* Billboard Image */}
                                {billboard.featured_image && billboard.featured_image !== false ? (
                                    <img
                                        src={billboard.featured_image}
                                        alt={billboard.title}
                                        className="w-full h-auto mb-3 md:mb-4 rounded"
                                    />
                                ) : (
                                    <div className="aspect-video bg-gray-200 mb-3 md:mb-4 rounded"></div>
                                )}
                                <h3 className="font-semibold text-sm md:text-base">{billboard.name}</h3>
                                <p className="text-xs md:text-sm text-gray-600">Location: {billboard.location}</p>
                                <p className="text-xs md:text-sm font-semibold mt-2">{adbridgeData.currency} {billboard.pricing.daily}/day</p>
                                {console.log(billboard)}
                                {billboard.attributes?.map((attr, index) => (
                                    <p key={index} className="text-sm text-gray-600">
                                        {attr.attribute}: {attr.value}
                                    </p>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BillboardStep;
