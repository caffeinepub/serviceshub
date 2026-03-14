import Text "mo:core/Text";
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Category = {
    #design;
    #programming;
    #marketing;
    #writing;
    #video;
    #music;
    #business;
    #other;
  };

  module Category {
    public func compare(cat1 : Category, cat2 : Category) : Order.Order {
      switch (cat1, cat2) {
        case (#design, #design) { #equal };
        case (#design, _) { #less };
        case (#programming, #design) { #greater };
        case (#programming, #programming) { #equal };
        case (#programming, _) { #less };
        case (#marketing, #marketing) { #equal };
        case (#marketing, #writing) { #less };
        case (#marketing, _) { #greater };
        case (#writing, #writing) { #equal };
        case (#writing, _) { #greater };
        case (#video, #video) { #equal };
        case (#video, #music) { #less };
        case (#video, _) { #greater };
        case (#music, #music) { #equal };
        case (#music, _) { #greater };
        case (#business, #business) { #equal };
        case (#business, #other) { #less };
        case (#business, _) { #greater };
        case (#other, #other) { #equal };
        case (#other, _) { #greater };
      };
    };
  };

  type Service = {
    id : Nat;
    title : Text;
    description : Text;
    price : Float;
    category : Category;
    sellerId : Principal;
    sellerName : Text;
    createdAt : Int;
    active : Bool;
  };

  module Service {
    public func compareByPrice(service1 : Service, service2 : Service) : Order.Order {
      if (service1.price < service2.price) { #less } else if (service1.price > service2.price) {
        #greater;
      } else {
        #equal;
      };
    };

    public func compareByCreatedAt(service1 : Service, service2 : Service) : Order.Order {
      if (service1.createdAt < service2.createdAt) { #less } else if (service1.createdAt > service2.createdAt) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let services = Map.empty<Nat, Service>();
  var nextServiceId = 0;

  // Initialize the mixin state for authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Validate input
  func validateServiceInput(title : Text, description : Text, price : Float) {
    if (title.size() < 3 or title.size() > 100) {
      Runtime.trap(
        "Invalid title length. Title must be between 3 and 100 characters."
      );
    };
    if (description.size() < 10 or description.size() > 1000) {
      Runtime.trap(
        "Invalid description length. Description must be between 10 and 1000 characters."
      );
    };
    if (
      price < 0.0001 or price > 100_000
    ) {
      Runtime.trap("Invalid price. Must be between 0.0001 and 100_000 units");
    };
  };

  public shared ({ caller }) func createService(
    title : Text,
    description : Text,
    price : Float,
    category : Category,
    sellerName : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create services");
    };

    if (sellerName.size() == 0 or sellerName.size() > 50) {
      Runtime.trap("Invalid seller name. Must be 1-50 characters");
    };

    // Validate input
    validateServiceInput(title, description, price);

    let serviceId = nextServiceId;
    nextServiceId += 1;

    let service : Service = {
      id = serviceId;
      title;
      description;
      price;
      category;
      sellerId = caller;
      sellerName;
      createdAt = Time.now();
      active = true;
    };

    services.add(serviceId, service);
    serviceId;
  };

  public shared ({ caller }) func editService(
    serviceId : Nat,
    title : Text,
    description : Text,
    price : Float,
    category : Category
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit services");
    };

    let existingService = switch (services.get(serviceId)) {
      case (null) { Runtime.trap("The requested service does not exist") };
      case (?service) { service };
    };

    // Only owner can edit
    if (existingService.sellerId != caller) {
      Runtime.trap("Only the owner can edit this service");
    };

    // Validate input
    validateServiceInput(title, description, price);

    let updatedService : Service = {
      existingService with
      title;
      description;
      price;
      category;
      createdAt = Time.now();
    };

    services.add(serviceId, updatedService);
  };

  public query ({ caller }) func getAllActiveServices(category : ?Category, sortByPrice : ?Bool) : async [Service] {
    let serviceList = List.empty<Service>();

    for (service in services.values()) {
      if (service.active) {
        switch (category) {
          case (?cat) {
            if (service.category == cat) {
              serviceList.add(service);
            };
          };
          case (null) {
            serviceList.add(service);
          };
        };
      };
    };

    let serviceArray = serviceList.toArray();

    switch (sortByPrice) {
      case (?true) { serviceArray.sort(Service.compareByPrice) };
      case (_) { serviceArray.sort(Service.compareByCreatedAt) };
    };
  };

  public query ({ caller }) func searchServices(searchText : Text) : async [Service] {
    let serviceList = List.empty<Service>();
    let searchTextLower = searchText.toLower();

    for (service in services.values()) {
      if (service.active) {
        let titleContains = service.title.toLower().contains(#text searchTextLower);
        let descContains = service.description.toLower().contains(#text searchTextLower);

        if (titleContains or descContains) {
          serviceList.add(service);
        };
      };
    };

    serviceList.toArray();
  };

  public query ({ caller }) func getServicesBySeller(sellerId : Principal) : async [Service] {
    let serviceList = List.empty<Service>();

    for (service in services.values()) {
      if (service.sellerId == sellerId) {
        serviceList.add(service);
      };
    };

    serviceList.toArray();
  };

  public query ({ caller }) func getServiceById(serviceId : Nat) : async ?Service {
    services.get(serviceId);
  };

  public shared ({ caller }) func toggleServiceActive(serviceId : Nat) : async {
    active : Bool;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle services");
    };

    let existingService = switch (services.get(serviceId)) {
      case (null) { Runtime.trap("The requested service does not exist") };
      case (?service) { service };
    };

    // Only owner can toggle
    if (existingService.sellerId != caller) {
      Runtime.trap("Only the owner can toggle this service");
    };

    let updatedService = { existingService with active = not existingService.active };

    services.add(serviceId, updatedService);
    { active = updatedService.active };
  };

  public shared ({ caller }) func deleteService(serviceId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete services");
    };

    let existingService = switch (services.get(serviceId)) {
      case (null) { Runtime.trap("The requested service does not exist") };
      case (?service) { service };
    };

    // Only owner can delete
    if (existingService.sellerId != caller) {
      Runtime.trap("Only the owner can delete this service");
    };

    services.remove(serviceId);
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    [#design, #programming, #marketing, #writing, #video, #music, #business, #other].sort();
  };

  public query ({ caller }) func getServiceCount() : async Nat {
    services.size();
  };

  public query ({ caller }) func getServiceStats() : async {
    total : Nat;
    active : Nat;
    inactive : Nat;
  } {
    var activeCount = 0;
    for (service in services.values()) {
      if (service.active) {
        activeCount += 1;
      };
    };
    {
      total = services.size();
      active = activeCount;
      inactive = services.size() - activeCount;
    };
  };

  public query ({ caller }) func getServiceByCategory(category : Category) : async [Service] {
    let serviceList = List.empty<Service>();

    for (service in services.values()) {
      if (service.category == category and service.active) {
        serviceList.add(service);
      };
    };

    serviceList.toArray();
  };
};
