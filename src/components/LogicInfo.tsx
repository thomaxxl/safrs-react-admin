import React, { useState, useEffect } from 'react';
import { UnthemedCollapsAccordion } from "./util/Accordion";
import RuleList from "./apifab/RuleList";
import { useConf } from "../Config";

const LogicInfo = ({projData}) => {
  const conf = useConf();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch(`${conf.ui_root}/active_rules.json`);
        const data = await response.json();
        setRules(data);
      } catch (error) {
        console.error('Failed to fetch rules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  return (
    <UnthemedCollapsAccordion title="Logic Rules" defaultExpanded={false} sx={{ borderTop: "1px solid #ddd" }}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <RuleList rules={rules} fetchMoreRules={null} ruleListItemActions={<span></span>}/>
      )}
    </UnthemedCollapsAccordion>
  );
};

export default LogicInfo;