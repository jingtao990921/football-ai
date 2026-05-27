import { useEffect, useState } from "react";
import { supabase } from "./supabase/client";

type Match = {
    id: string;
    home_team: string;
    away_team: string;
    league: string;
    match_time: string;
};

export default function MatchList() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
  const getSession = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profile || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  getSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      setUser(null);
      setProfile(null);
      return;
    }

    setUser(session.user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profile || null);
  });

  return () => subscription.unsubscribe();
}, []);
  const getSession = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profile || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  getSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      setUser(null);
      setProfile(null);
      return;
    }

    setUser(session.user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profile || null);
  });

  return () => subscription.unsubscribe();
}, []);
        async function loadMatches() {
            const { data, error } = await supabase
                .from("matches")
                .select("*")
                .order("match_time", { ascending: true });

            if (error) {
                console.error(error);
            } else {
                setMatches(data || []);
            }

            setLoading(false);
        }

        loadMatches();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div
            style={{
                background: "#111",
                minHeight: "100vh",
                color: "white",
                padding: "20px",
                fontFamily: "Arial",
            }}
        >
            <h1>Football Matches</h1>

            {matches.length === 0 ? (
                <p>No matches found.</p>
            ) : (
                <ul>
                    {matches.map((match) => (
                        <li key={match.id} style={{ marginBottom: "10px" }}>
                            {new Date(match.match_time).toLocaleString()} |{" "}
                            {match.league} | {match.home_team} vs {match.away_team}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}