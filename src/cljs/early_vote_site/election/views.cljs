(ns early-vote-site.election.views
  (:require [cljs-pikaday.reagent :as pikaday]
            [clojure.set :as set]
            [early-vote-site.constants :as constants]
            [early-vote-site.utils :as utils]
            [re-frame.core :as re-frame]
            [reagent.ratom :as ratom]))

(defn state-select-row
  [state]
  [:option {:value (:fips-code state) :key (:fips-code state)} (:state-name state)])

(defn form [id]
  (let [all-forms @(re-frame/subscribe [:election-forms])
        state (get-in all-forms [id :state])
        date (get-in all-forms [id :date])]
    [:tr {:key (str "editing-" id)}
      [:td
       [:select {:id "state" :type "text" :class "form-control"
                 :value state
                 :on-change #(re-frame/dispatch [:election-form/update
                                                 id :state
                                                 (-> % .-target .-value)])}
        (map #(state-select-row %)
             (concat [{:fips-code "" :state-name "Select a State"}]
                     constants/states))]]
      [:td
       [pikaday/date-selector
        {:class "form-control"
         :date-atom (ratom/atom date)
         :pikaday-attrs
         {:min-date (js/Date.)
          :on-select #(re-frame/dispatch
                       [:election-form/update id :date %])}}]]
      [:td
       [:button.button
        {:on-click #(re-frame/dispatch [:election-form/save id])
         :disabled @(re-frame/subscribe [:create-disabled?])}
        "save"]
       (when-not (= :new id)
         [:button.button
          {:on-click #(re-frame/dispatch [:elections/end-edit id])
           :disabled @(re-frame/subscribe [:create-disabled?])}
          "cancel"])]]))

(defn election-list-row
  [election]
  (let [roles @(re-frame/subscribe [:roles])
        editing @(re-frame/subscribe [:elections/editing])]
    (if (contains? editing (:id election))
      [form (:id election)]
      [:tr {:key (str "viewing-" (:id election))}
       [:td {:name "election-state"} (-> election :state-fips utils/format-fips)]
       [:td {:name "election-date" :on-click #(re-frame/dispatch [:election-list/election-selected (:id election)])}
        [:div {:class "btn-link"} (-> election :election-date utils/format-date-string)]]
       [:td
        [:button.button {:style {:visibility
                                 (if (seq (set/intersection roles #{"super-admin" "state-admin"}))
                                   "visible"
                                   "hidden")}
                         :on-click #(re-frame/dispatch [:elections/start-edit election])}
                        "edit"]]])))

(defn election-table []
  (let [election-list-items @(re-frame/subscribe [:elections/list])
        roles @(re-frame/subscribe [:roles])]
    [:table {:name "election-list"}
     [:thead
      [:tr {:key "elections-head-row"}
       [:th {:name "election-state"} "State"]
       [:th {:name "election-date"} "Date"]
       [:th {:name "action"}]]]
     [:tbody
      (if (seq election-list-items)
        (doall (map election-list-row election-list-items))
        [:tr [:td {:col-span 3} "No Elections"]])
      (when (contains? roles "super-admin")
        [form :new])]]))

(defn breadcrumb []
  [:nav {:aria-label "breadcrumb"
         :role "navigation"}
   [:ol {:class "breadcrumb"}
    [:li {:class "breadcrumb-item active"}
      "Elections"]]])

(defn main-panel []
  [:div
   [breadcrumb]
   [election-table]])
