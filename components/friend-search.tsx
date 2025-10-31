"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Users, X, Check } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface SearchResult {
  id: string;
  displayName: string;
  primaryEmail: string;
  profileImageUrl?: string;
  isFriend: boolean;
  isPending: boolean;
}

export function FriendSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendRequests, setFriendRequests] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const user = useUser();
  const { toast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/users/search?query=${encodeURIComponent(searchQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.users || []);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Load friend requests
  useEffect(() => {
    const loadFriendRequests = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/friends/requests");
        if (response.ok) {
          const data = await response.json();
          setFriendRequests(data.requests || []);
        }
      } catch (error) {
        console.error("Error loading friend requests:", error);
      }
    };

    if (isOpen) {
      loadFriendRequests();
    }
  }, [isOpen, user]);

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (response.ok) {
        toast({
          title: "Friend Request Sent",
          description: "Your friend request has been sent!",
        });
        // Update the search results to reflect pending state
        setSearchResults((prev) =>
          prev.map((result) =>
            result.id === userId ? { ...result, isPending: true } : result
          )
        );
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to send friend request",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        toast({
          title: "Friend Request Accepted",
          description: "You are now friends!",
        });
        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await fetch("/api/friends/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });

      if (response.ok) {
        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 w-64"
        />
        {friendRequests.length > 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="relative">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {friendRequests.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Friend Requests Section */}
          {friendRequests.length > 0 && (
            <div className="border-b border-gray-700">
              <div className="px-4 py-3 bg-gray-800/50">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Friend Requests ({friendRequests.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-700">
                {friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="px-4 py-3 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {request.profileImageUrl ? (
                        <Image
                          src={request.profileImageUrl}
                          alt={request.displayName}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {request.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {request.displayName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {request.primaryEmail}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeclineRequest(request.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results Section */}
          {searchQuery.trim().length >= 2 && (
            <div>
              <div className="px-4 py-3 bg-gray-800/50">
                <h3 className="text-sm font-semibold text-white">
                  {isSearching ? "Searching..." : "Search Results"}
                </h3>
              </div>
              <div className="divide-y divide-gray-700">
                {searchResults.length === 0 && !isSearching ? (
                  <div className="px-4 py-8 text-center text-gray-400 text-sm">
                    No users found
                  </div>
                ) : (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="px-4 py-3 hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {result.profileImageUrl ? (
                          <Image
                            src={result.profileImageUrl}
                            alt={result.displayName}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {result.displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {result.displayName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {result.primaryEmail}
                          </p>
                        </div>
                        {result.isFriend ? (
                          <span className="text-xs text-green-500 font-medium">
                            Friends
                          </span>
                        ) : result.isPending ? (
                          <span className="text-xs text-yellow-500 font-medium">
                            Pending
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendFriendRequest(result.id)}
                            className="h-8 px-3 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {friendRequests.length === 0 &&
            (!searchQuery.trim() || searchQuery.length < 2) && (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p>Search for friends by name or email</p>
                <p className="text-xs mt-1">Type at least 2 characters</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
