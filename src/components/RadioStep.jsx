import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCampaignStore from "@/stores/useCampaignStore";
import { useEffect, useState } from "react";
import axios from 'axios';

const RadioStep = () => {
    const {
        radio,
        setRadioFilters,
        setCurrentStep,
        campaignType
    } = useCampaignStore();

    const [radioStations, setRadioStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStations = async () => {
            setLoading(true);
            setError(null);
            try {
                const type = campaignType === "tv" ? "tv" : "radio"; // Adjust based on campaignType
                const response = await axios.get(`http://localhost/wordpress/wp-json/adrentals/v1/campaigns?adrentals_type=${type}`);
                setRadioStations(response.data);
            } catch (err) {
                setError(err);
                console.error("Error fetching stations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStations();
    }, [campaignType]);

    // Extract unique station types and locations from data
    const stationTypes = ["all", ...new Set(radioStations.map(station => station._adrentals_type))];
    const locations = ["all", ...new Set(radioStations.flatMap(station => station.adrental_location))];

    // Corrected filtering logic
    const filteredStations = radioStations.filter((r) => {
        const matchesType = radio.selectedCategory === "all" || r._adrentals_type === radio.selectedCategory;
        const matchesLocation = radio.selectedLocation === "all" || r.adrental_location?.includes(radio.selectedLocation);
        const matchesSearch = radio.searchTerm ? r.title?.toLowerCase().includes(radio.searchTerm.toLowerCase()) : true;

        return matchesType && matchesLocation && matchesSearch;
    });

    if (loading) {
        return <div>Loading {campaignType === "tv" ? "TV Channels" : "Radio Stations"}...</div>;
    }

    if (error) {
        return <div>Error loading {campaignType === "tv" ? "TV Channels" : "Radio Stations"}.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center"
                >
                    ← Back
                </Button>
                <h2 className="text-2xl font-semibold">
                    {campaignType === "tv" ? "Select TV Channel" : "Select Radio Station"}
                </h2>
            </div>

            <p className="text-gray-600">
                {campaignType === "tv"
                    ? "Choose a TV channel for your campaign. You can filter by type, location, or search by name."
                    : "Choose a radio station for your campaign. You can filter by type, location, or search by name."}
            </p>

            {/* Search & Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        type="text"
                        placeholder={`Search ${campaignType === "tv" ? "TV Channels" : "Radio Stations"}...`}
                        value={radio.searchTerm}
                        onChange={(e) => setRadioFilters({ searchTerm: e.target.value })}
                        className="w-full"
                    />
                </div>

                {/* Dynamic Station Type Filter */}
                <Select
                    value={radio.selectedCategory}
                    onValueChange={(value) => setRadioFilters({ selectedCategory: value })}
                >
                    <SelectTrigger className="w-48 min-w-[150px]">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {stationTypes.map(type => (
                            <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Dynamic Location Filter */}
                <Select
                    value={radio.selectedLocation}
                    onValueChange={(value) => setRadioFilters({ selectedLocation: value })}
                >
                    <SelectTrigger className="w-48 min-w-[150px]">
                        <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map(location => (
                            <SelectItem key={location} value={location}>
                                {location.charAt(0).toUpperCase() + location.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Stations List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStations.map((station) => (
                    <Card
                        key={station.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                            setRadioFilters({ selectedStation: station });
                            setCurrentStep(3);
                        }}
                    >
                        <CardContent className="p-4">
                            <div className="aspect-video bg-gray-200 mb-4 rounded"></div>
                            <h3 className="font-semibold">{station.title}</h3>
                            {station.attributes?.map((attr, index) => (
                                <p key={index} className="text-sm text-gray-600">
                                    {attr.attribute}: {attr.value}
                                </p>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RadioStep;
