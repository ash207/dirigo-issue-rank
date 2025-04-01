
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import IssueCard from "@/components/issues/IssueCard";
import IssueFilter from "@/components/issues/IssueFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const IssuesPage = () => {
  // Mock issues data
  const allIssues = [
    { id: "1", title: "Should the minimum wage be increased to $15/hour nationwide?", category: "federal", votes: 1240, positions: 23 },
    { id: "2", title: "Is expanding public transportation in our city worth the investment?", category: "local", votes: 864, positions: 15 },
    { id: "3", title: "Should our state implement stricter water conservation measures?", category: "state", votes: 932, positions: 18 },
    { id: "4", title: "Should community college be tuition-free?", category: "education", votes: 1105, positions: 27 },
    { id: "5", title: "Should we increase the budget for road repairs in our county?", category: "local", votes: 543, positions: 8 },
    { id: "6", title: "Should the electoral college be abolished?", category: "federal", votes: 2105, positions: 42 },
    { id: "7", title: "Should our state increase funding for renewable energy research?", category: "environment", votes: 876, positions: 19 },
    { id: "8", title: "Is rent control an effective solution to housing affordability?", category: "economy", votes: 1432, positions: 31 },
    { id: "9", title: "Should our city implement a plastic bag ban?", category: "environment", votes: 731, positions: 12 },
  ];

  const [filteredIssues, setFilteredIssues] = useState(allIssues);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = (category: string, verification: string) => {
    let filtered = [...allIssues];
    
    if (category !== "all") {
      filtered = filtered.filter(issue => issue.category.toLowerCase() === category.toLowerCase());
    }
    
    // For now, we're not filtering by verification since we don't have that data
    // When we have the backend, we would implement this
    
    if (searchQuery) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredIssues(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = allIssues.filter(issue => 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredIssues(filtered);
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Browse Issues</h1>
        
        {/* Search and filter section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-dirigo-blue">
              <Search size={18} className="mr-2" /> Search
            </Button>
          </form>
          
          <IssueFilter onFilterChange={handleFilterChange} />
        </div>
        
        {/* Issues grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map(issue => (
            <IssueCard key={issue.id} {...issue} />
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No issues found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IssuesPage;
